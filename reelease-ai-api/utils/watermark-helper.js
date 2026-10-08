const sharp = require('sharp');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { db } = require('../models');
const Setting = db.Setting;
const AITask = db.AITask;
const Subscription = db.Subscription;
const mediaProcessor = require('./mediaProcessor');
const { downloadAudioIfNeeded, cleanupTempAudio } = require('./audio-helper');

const isTruthyFlag = (v) => v === true || v === 'true' || v === 1 || v === '1';

const getTaskPayload = (task) => {
  if (!task?.payload) return {};
  let payload = task.payload;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return {};
    }
  }
  return payload && typeof payload === 'object' ? payload : {};
};

const isWatermarkRequestedOnTask = (task) => {
  const payload = getTaskPayload(task);
  return [
    payload.addWatermark,
    payload.allowWatermark,
  ].some(isTruthyFlag);
};

const normalizeSharpBlend = (mode) => {
  if (!mode || mode === 'normal') return 'over';
  const allowed = new Set([
    'over',
    'in',
    'out',
    'atop',
    'dest',
    'dest-over',
    'dest-in',
    'dest-out',
    'dest-atop',
    'xor',
    'add',
    'saturate',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'colour-dodge',
    'color-dodge',
    'colour-burn',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion',
  ]);
  return allowed.has(mode) ? mode : 'over';
};

const getAdminWatermarkSettings = async () => {
  const settings = await Setting.findOne().lean();
  if (!settings || !isTruthyFlag(settings.watermark_enabled)) return null;
  return settings;
};

const getUserWatermarkSettingsForGeneration = async (userId) => {
  if (!userId) return null;
  const userSettings = await db.UserSettings.findOne({ user: userId }).lean();
  if (!userSettings) return null;

  const wmType = userSettings.watermark_type || 'text';
  if (wmType === 'image') {
    if (!userSettings.watermark_image_url) return null;
  } else if (!userSettings.watermark_text?.trim()) {
    return null;
  }
  return userSettings;
};

const userHasRemoveWatermarkPlan = async (userId) => {
  if (!userId) return false;
  const subscription = await Subscription.findOne({
    user_id: userId,
    status: { $in: ['active', 'trial'] },
  })
    .populate('plan_id')
    .lean();
  return !!(subscription?.plan_id?.remove_watermark);
};

const resolveWatermarkLayers = async (userId, task = null) => {
  const userRequested = task ? isWatermarkRequestedOnTask(task) : false;
  const removeWatermark = await userHasRemoveWatermarkPlan(userId);

  if (userRequested) {
    return { applyAdmin: false, applyUser: true };
  }
  if (removeWatermark) {
    return { applyAdmin: false, applyUser: false };
  }
  return { applyAdmin: true, applyUser: false };
};

const applyWatermarkWithSettings = async (filePath, fileType, settings) => {
  if (!settings) return filePath;
  if (fileType === 'image') return applyToImage(filePath, settings);
  if (fileType === 'video') return applyToVideo(filePath, settings);
  return filePath;
};

const applyWatermarkLayers = async (filePath, fileType, userId, task = null) => {
  const layers = await resolveWatermarkLayers(userId, task);
  let currentPath = filePath;

  try {
    if (layers.applyAdmin) {
      const adminSettings = await getAdminWatermarkSettings();
      if (adminSettings) {
        currentPath = await applyWatermarkWithSettings(currentPath, fileType, adminSettings);
      }
    }
    if (layers.applyUser) {
      const userSettings = await getUserWatermarkSettingsForGeneration(userId);
      if (userSettings) {
        currentPath = await applyWatermarkWithSettings(currentPath, fileType, userSettings);
      }
    }
  } catch (error) {
    console.error('[watermark] applyWatermarkLayers failed:', error.message);
  }

  return currentPath;
};

const applyWatermark = async (filePath, fileType, userId = null, options = {}) => {
  const task = options.task || null;
  return applyWatermarkLayers(filePath, fileType, userId, task);
};

const applyToImage = async (filePath, settings) => {
  const tempPath = filePath + '_temp' + path.extname(filePath);
  const metadata = await sharp(filePath).metadata();
  const { width, height } = metadata;

  const result = await getWatermarkOverlay(settings, width, height);
  if (!result) {
    console.warn('[watermark] No overlay generated for settings type:', settings.watermark_type || 'text');
    return filePath;
  }

  try {
    await sharp(filePath)
      .composite([
        {
          input: result.buffer,
          gravity: result.gravity,
          blend: normalizeSharpBlend(settings.watermark_blend_mode),
        },
      ])
      .toFile(tempPath);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    console.error('[watermark] applyToImage failed:', error.message);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw error;
  }
  return filePath;
};

const getWatermarkOverlay = async (settings, width, height) => {
  const padding = settings.watermark_padding || 40;
  const opacity = (settings.watermark_opacity || 100) / 100;
  const rotation = settings.watermark_rotation || 0;

  const watermarkType = settings.watermark_type || 'text';

  if (watermarkType === 'text' || (watermarkType !== 'image' && settings.watermark_text)) {
    const fontSize = Math.floor(width * (settings.watermark_scale / 1000)) || 48;
    const colorMapping = {
      'White': '#FFFFFF',
      'Dark': '#1e293b',
      'System': '#6366f1',
      'Emerald': '#10b981',
      'Amber': '#f59e0b',
      'Violet': '#8b5cf6',
      'Cyan': '#06b6d4',
      'Ocean': '#3b82f6',
      'Neon': '#22c55e',
      'Gold': '#eab308',
      'Rose': '#ec4899',
      'Sunset': 'url(#sunset-grad)',
      'white': '#FFFFFF',
      'dark': '#1e293b',
      'system': '#6366f1',
      'emerald': '#10b981',
      'amber': '#f59e0b',
      'violet': '#8b5cf6',
      'cyan': '#06b6d4',
      'ocean': '#3b82f6',
      'neon': '#22c55e',
      'gold': '#eab308',
      'rose': '#ec4899',
      'sunset': 'url(#sunset-grad)'
    };

    const color = colorMapping[settings.watermark_color] || settings.watermark_color || 'white';
    const isTiled = settings.watermark_tiling;
    const style = (settings.watermark_style || 'solid').toLowerCase();

    let textStyle = `font-style: ${settings.watermark_italic ? 'italic' : 'normal'}; text-decoration: ${settings.watermark_underline ? 'underline' : 'none'}; `;
    let backgroundRect = '';

    if (style === 'outline') {
      textStyle += `fill: none; stroke: ${color}; stroke-width: ${Math.max(1, fontSize / 20)}px;`;
    } else if (style === 'glass') {
      const boxPadding = fontSize / 2;
      backgroundRect = `
        <rect 
          x="-${boxPadding}" 
          y="-${fontSize / 1.5}" 
          width="calc(100% + ${boxPadding * 2}px)" 
          height="${fontSize * 1.5}px" 
          fill="rgba(255,255,255,0.15)" 
          stroke="rgba(255,255,255,0.25)" 
          rx="${fontSize / 4}" 
        />`;
      textStyle += `fill: ${color}; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));`;
    } else {
      textStyle += `fill: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));`;
    }

    if (isTiled) {
      const boxWidth = Math.floor(fontSize * settings.watermark_text.length * 0.6) + fontSize;
      const boxHeight = Math.floor(fontSize * 1.6);
      const tileWidth = boxWidth + (fontSize * 1.5);
      const tileHeight = boxHeight + (fontSize * 2.5);
      const rx = boxHeight / 2;

      const svgTiled = `
        <svg width="${width}" height="${height}">
          <defs>
            <linearGradient id="sunset-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#ff5f6d;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ffc371;stop-opacity:1" />
            </linearGradient>
            <pattern id="tile-pattern" x="0" y="0" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
              ${style === 'glass' ? `
                <rect 
                  x="${(tileWidth - boxWidth) / 2}" 
                  y="${(tileHeight - boxHeight) / 2}" 
                  width="${boxWidth}" 
                  height="${boxHeight}" 
                  fill="rgba(255,255,255,0.12)" 
                  stroke="rgba(255,255,255,0.2)" 
                  rx="${rx}" 
                  opacity="${opacity}"
                />
              ` : ''}
              <text 
                x="${tileWidth / 2}" 
                y="${tileHeight / 2}" 
                text-anchor="middle" 
                dominant-baseline="middle"
                style="${textStyle} font-size: ${fontSize}px; font-weight: ${settings.watermark_font_weight?.toLowerCase() || 'bold'}; font-family: ${settings.watermark_font || 'Inter'}, sans-serif; opacity: ${opacity};"
              >${settings.watermark_text}</text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tile-pattern)" />
        </svg>`;
      return { buffer: Buffer.from(svgTiled), gravity: 'northwest' };
    }

    let x, y, anchor;
    switch (settings.watermark_position) {
      case 'top-left': x = padding; y = padding + fontSize; anchor = 'start'; break;
      case 'top-center': x = '50%'; y = padding + fontSize; anchor = 'middle'; break;
      case 'top-right': x = width - padding; y = padding + fontSize; anchor = 'end'; break;
      case 'center-left': x = padding; y = '50%'; anchor = 'start'; break;
      case 'center': x = '50%'; y = '50%'; anchor = 'middle'; break;
      case 'center-right': x = width - padding; y = '50%'; anchor = 'end'; break;
      case 'bottom-left': x = padding; y = height - padding; anchor = 'start'; break;
      case 'bottom-center': x = '50%'; y = height - padding; anchor = 'middle'; break;
      case 'bottom-right': x = width - padding; y = height - padding; anchor = 'end'; break;
      default: x = width - padding; y = height - padding; anchor = 'end';
    }

    const boxWidth = Math.floor(fontSize * settings.watermark_text.length * 0.6) + fontSize;
    const boxHeight = Math.floor(fontSize * 1.6);
    const rx = boxHeight / 2;
    let boxX = x;
    if (anchor === 'middle') boxX = (width / 2) - (boxWidth / 2);
    else if (anchor === 'end') boxX = (width - padding) - boxWidth;
    else boxX = padding - (fontSize * 0.5);

    const svgText = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="sunset-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ff5f6d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffc371;stop-opacity:1" />
          </linearGradient>
        </defs>
        <g transform="rotate(${rotation}, ${x === '50%' ? width / 2 : x}, ${y === '50%' ? height / 2 : y})">
          ${style === 'glass' ? `
             <rect 
              x="${x === '50%' ? `calc(50% - ${boxWidth / 2}px)` : boxX}" 
              y="${y === '50%' ? `calc(50% - ${boxHeight / 2}px)` : y - (boxHeight / 2)}" 
              width="${boxWidth}" 
              height="${boxHeight}" 
              fill="rgba(255,255,255,0.12)" 
              stroke="rgba(255,255,255,0.2)" 
              rx="${rx}" 
              opacity="${opacity}"
            />
          ` : ''}
          <text 
            x="${x}" 
            y="${y}" 
            text-anchor="${anchor}" 
            dominant-baseline="middle"
            style="${textStyle} font-size: ${fontSize}px; font-weight: ${settings.watermark_font_weight?.toLowerCase() || 'bold'}; font-family: ${settings.watermark_font || 'Inter'}, sans-serif; opacity: ${opacity};"
          >${settings.watermark_text}</text>
        </g>
      </svg>`;
    return { buffer: Buffer.from(svgText), gravity: 'northwest' };


  }

  if (watermarkType === 'image' && settings.watermark_image_url) {
    const watermarkImagePath = path.join(process.cwd(), settings.watermark_image_url.replace(/^\//, ''));
    if (!fs.existsSync(watermarkImagePath)) return null;

    const watermarkMetadata = await sharp(watermarkImagePath).metadata();
    const wScale = (width * (settings.watermark_scale / 100)) / watermarkMetadata.width;
    const wWidth = Math.floor(watermarkMetadata.width * wScale);
    const wHeight = Math.floor(watermarkMetadata.height * wScale);

    if (settings.watermark_tiling) {
      const tileWidth = wWidth * 2;
      const tileHeight = wHeight * 2;
      const patternSvg = `
        <svg width="${width}" height="${height}">
          <defs>
            <pattern id="img-pattern" x="0" y="0" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
              <image href="data:image/png;base64,${(await sharp(watermarkImagePath).resize(wWidth).toBuffer()).toString('base64')}" x="${(tileWidth - wWidth) / 2}" y="${(tileHeight - wHeight) / 2}" width="${wWidth}" height="${wHeight}" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#img-pattern)" opacity="${opacity}" />
        </svg>`;
      return { buffer: Buffer.from(patternSvg), gravity: 'northwest' };
    }

    let x, y;
    switch (settings.watermark_position) {
      case 'top-left': x = padding; y = padding; break;
      case 'top-center': x = (width - wWidth) / 2; y = padding; break;
      case 'top-right': x = width - wWidth - padding; y = padding; break;
      case 'center-left': x = padding; y = (height - wHeight) / 2; break;
      case 'center': x = (width - wWidth) / 2; y = (height - wHeight) / 2; break;
      case 'center-right': x = width - wWidth - padding; y = (height - wHeight) / 2; break;
      case 'bottom-left': x = padding; y = height - wHeight - padding; break;
      case 'bottom-center': x = (width - wWidth) / 2; y = height - wHeight - padding; break;
      case 'bottom-right': x = width - wWidth - padding; y = height - wHeight - padding; break;
      default: x = width - wWidth - padding; y = height - wHeight - padding;
    }

    const imageBase64 = (await sharp(watermarkImagePath).resize(wWidth).toBuffer()).toString('base64');
    const singleImgSvg = `
      <svg width="${width}" height="${height}">
        <image 
          href="data:image/png;base64,${imageBase64}" 
          x="${x}" 
          y="${y}" 
          width="${wWidth}" 
          height="${wHeight}" 
          opacity="${opacity}"
          transform="rotate(${rotation}, ${x + wWidth / 2}, ${y + wHeight / 2})"
        />
      </svg>`;

    return { buffer: Buffer.from(singleImgSvg), gravity: 'northwest' };
  }

  return null;
};

const applyToVideo = async (filePath, settings) => {
  return new Promise(async (resolve, reject) => {
    const tempPath = filePath + '_watermarked.mp4';
    const watermarkTempImage = filePath + '_wm.png';
    const command = ffmpeg(filePath);

    try {
      let watermarkSource;
      let opacity = settings.watermark_opacity / 100;

      if (settings.watermark_type === 'text') {
        const fontSize = 48;
        const svgText = `
          <svg width="1000" height="200">
            <style>
              .title { fill: ${settings.watermark_color || 'white'}; font-size: ${fontSize}px; font-weight: ${settings.watermark_font_weight.toLowerCase()}; font-family: ${settings.watermark_font}; opacity: ${opacity}; }
            </style>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="title">${settings.watermark_text}</text>
          </svg>`;
        await sharp(Buffer.from(svgText)).png().toFile(watermarkTempImage);
        watermarkSource = watermarkTempImage;
      } else if (settings.watermark_image_url) {
        const watermarkImagePath = path.join(process.cwd(), settings.watermark_image_url.replace(/^\//, ''));
        if (fs.existsSync(watermarkImagePath)) {
          await sharp(watermarkImagePath).png().toFile(watermarkTempImage);
          watermarkSource = watermarkTempImage;
        }
      }

      if (!watermarkSource) {
        resolve(filePath);
        return;
      }

      const position = getFFmpegOverlayPosition(settings.watermark_position);
      const scale = settings.watermark_scale / 100;

      command
        .input(watermarkSource)
        .complexFilter([
          `[1:v]scale=iw*${scale}:-1[wm];[0:v][wm]overlay=${position}`
        ])
        .on('error', (err) => {
          console.error('FFmpeg watermark error:', err);
          if (fs.existsSync(watermarkTempImage)) fs.unlinkSync(watermarkTempImage);
          resolve(filePath);
        })
        .on('end', () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          fs.renameSync(tempPath, filePath);
          if (fs.existsSync(watermarkTempImage)) fs.unlinkSync(watermarkTempImage);
          resolve(filePath);
        })
        .save(tempPath);

    } catch (err) {
      console.error('Watermark preparation error:', err);
      resolve(filePath);
    }
  });
};

const compositeWatermarkOnBuffer = async (imageBuffer, settings) => {
  const metadata = await sharp(imageBuffer).metadata();
  const result = await getWatermarkOverlay(settings, metadata.width, metadata.height);
  if (!result) return imageBuffer;
  return sharp(imageBuffer)
    .composite([{ input: result.buffer, gravity: result.gravity }])
    .toBuffer();
};

const getWatermarkedBuffer = async (filePath, userId = null, task = null) => {
  try {
    const layers = await resolveWatermarkLayers(userId, task);
    let buffer = await sharp(filePath).toBuffer();
    let applied = false;

    if (layers.applyAdmin) {
      const adminSettings = await getAdminWatermarkSettings();
      if (adminSettings) {
        buffer = await compositeWatermarkOnBuffer(buffer, adminSettings);
        applied = true;
      }
    }
    if (layers.applyUser) {
      const userSettings = await getUserWatermarkSettingsForGeneration(userId);
      if (userSettings) {
        buffer = await compositeWatermarkOnBuffer(buffer, userSettings);
        applied = true;
      }
    }
    return applied ? buffer : null;
  } catch (error) {
    console.error('Error getting watermarked buffer:', error);
    return null;
  }
};

const downloadAndProcessMedia = async (taskId, mediaUrl, userId, req, isTest = false) => {
  try {
    const io = req.app.get('io');
    const mediaResponse = await axios({ method: 'GET', url: mediaUrl, responseType: 'stream' });

    const urlWithoutQuery = mediaUrl.split('?')[0];
    const extension = urlWithoutQuery.split('.').pop() || 'mp4';

    const fileName = `${isTest ? 'ai-test' : 'ai'}-${taskId}-${Date.now()}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'uploads/ai');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const writer = fs.createWriteStream(filePath);
    mediaResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const fileType = ['mp4', 'mov', 'avi', 'mkv'].includes(extension.toLowerCase()) ? 'video' : 'image';

    const task = await AITask.findOne({ task_id: taskId });
    const effectiveUserId = userId || task?.user_id;

    if (effectiveUserId) {
      await applyWatermarkLayers(filePath, fileType, effectiveUserId, task);
    }

    let processedPath = filePath;
    const meta = task?.payload || {};
    const musicPath = meta.backgroundMusicUrl || meta.backgroundMusicPath;
    const subtitleText =
      meta.prompt || meta.text || (meta.input && meta.input.prompt) || '';

    if (fileType === 'video' && musicPath) {
      let tempAudioPath = null;
      try {
        const { source, tempPath } = await downloadAudioIfNeeded(musicPath);
        tempAudioPath = tempPath;
        if (source) {
          const withMusic = path.join(uploadDir, `${path.basename(fileName, `.${extension}`)}_music.${extension}`);
          await mediaProcessor.replaceVideoAudio(processedPath, source, withMusic);
          if (processedPath !== filePath && fs.existsSync(processedPath)) fs.unlinkSync(processedPath);
          processedPath = withMusic;
        }
      } catch (musicErr) {
        console.error('[ai-video] background music merge failed:', musicErr.message);
      } finally {
        cleanupTempAudio(tempAudioPath);
      }
    }

    if (fileType === 'video' && meta.addSubtitles && meta.subtitleStyle && subtitleText) {
      try {
        const withSubs = path.join(uploadDir, `${path.basename(processedPath, `.${extension}`)}_subs.${extension}`);
        await mediaProcessor.burnSubtitleStyle(processedPath, subtitleText, meta.subtitleStyle, withSubs);
        if (processedPath !== filePath && fs.existsSync(processedPath)) fs.unlinkSync(processedPath);
        processedPath = withSubs;
      } catch (subErr) {
        console.error('[ai-video] subtitle burn failed:', subErr.message);
      }
    }

    if (processedPath !== filePath) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      fs.renameSync(processedPath, filePath);
    }

    const localUrl = `uploads/ai/${fileName}`;
    const taskUpdate = { status: 'completed', result_url: localUrl };
    const updatedTask = await AITask.findOneAndUpdate({ task_id: taskId }, taskUpdate, { new: true });

    const payload = {
      taskId,
      status: 'completed',
      resultUrl: localUrl,
      data: updatedTask
    };

    const eventName = isTest ? `ai-task-test-${taskId}` : `ai-task-${userId}`;
    if (io) io.emit(eventName, payload);

    return updatedTask;
  } catch (error) {
    console.error('Download and process media error:', error);
    await AITask.findOneAndUpdate({ task_id: taskId }, { status: 'failed', error_message: error.message });

    const io = req.app.get('io');
    const eventName = isTest ? `ai-task-test-${taskId}` : `ai-task-${userId}`;
    if (io) io.emit(eventName, { taskId, status: 'failed', message: error.message });
  }
};

const getFFmpegOverlayPosition = (pos) => {
  switch (pos) {
    case 'top-left': return '20:20';
    case 'top-center': return '(W-w)/2:20';
    case 'top-right': return 'W-w-20:20';
    case 'center-left': return '20:(H-h)/2';
    case 'center': return '(W-w)/2:(H-h)/2';
    case 'center-right': return 'W-w-20:(H-h)/2';
    case 'bottom-left': return '20:H-h-20';
    case 'bottom-center': return '(W-w)/2:H-h-20';
    case 'bottom-right': return 'W-w-20:H-h-20';
    default: return 'W-w-20:H-h-20';
  }
};

module.exports = {
  applyWatermark,
  applyWatermarkLayers,
  downloadAndProcessMedia,
  isWatermarkRequestedOnTask,
  resolveWatermarkLayers,
  getAdminWatermarkSettings,
  getWatermarkedBuffer,
  getUserWatermarkSettingsForGeneration,
  userHasRemoveWatermarkPlan,
};
