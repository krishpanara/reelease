const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpegStatic = require('@ffmpeg-installer/ffmpeg').path;
const sharp = require('sharp');
const axios = require('axios');

class MediaProcessor {
  isShortVideo(filePath) {
    if (!filePath || typeof filePath !== 'string') return false;
    const ext = path.extname(filePath).toLowerCase();
    return ['.mp4', '.mov', '.avi', '.m4v', '.webm'].includes(ext);
  }

  async processMedia(inputPath, outputPath, options = {}) {
    const {
      type = 'post',
      storyText = '',
      storyTextColor = '#ffffff',
      storyTextBg = 'rgba(0,0,0,0.6)',
      storyTextSize = 'md',
      storyTextPosition = 'center',
      storyBgColor = '#0f172a',
      audioUrl = ''
    } = options;

    const isVideo = this.isShortVideo(inputPath);
    const isStory = type === 'story';
    const isVerticalFormat = type === 'story' || type === 'reel' || type === 'shorts';

    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    if (!isVideo) {
      let tempImagePath = inputPath;
      
      if (isStory) {
        tempImagePath = path.join(outDir, `temp_story_${Date.now()}.png`);
        if (inputPath && fs.existsSync(inputPath)) {
          await sharp(inputPath)
            .resize(1080, 1920, {
              fit: 'contain',
              background: { r: 15, g: 15, b: 15, alpha: 1 }
            })
            .toFile(tempImagePath);
        } else {
          if (['sunset', 'indigo', 'violet', 'emerald'].includes(storyBgColor)) {
            let gradientSvg = '';
            if (storyBgColor === 'sunset') {
              gradientSvg = `
                <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#f43f5e" />
                      <stop offset="100%" stop-color="#f97316" />
                    </linearGradient>
                  </defs>
                  <rect width="1080" height="1920" fill="url(#g)" />
                </svg>
              `;
            } else if (storyBgColor === 'indigo') {
              gradientSvg = `
                <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#1e1b4b" />
                      <stop offset="100%" stop-color="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <rect width="1080" height="1920" fill="url(#g)" />
                </svg>
              `;
            } else if (storyBgColor === 'violet') {
              gradientSvg = `
                <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#7c3aed" />
                      <stop offset="100%" stop-color="#db2777" />
                    </linearGradient>
                  </defs>
                  <rect width="1080" height="1920" fill="url(#g)" />
                </svg>
              `;
            } else if (storyBgColor === 'emerald') {
              gradientSvg = `
                <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#064e3b" />
                      <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                  </defs>
                  <rect width="1080" height="1920" fill="url(#g)" />
                </svg>
              `;
            }

            await sharp(Buffer.from(gradientSvg))
              .png()
              .toFile(tempImagePath);
          } else {
            let r = 15, g = 23, b = 42;
            const hex = (storyBgColor || '#0f172a').replace('#', '');
            if (hex.length === 6) {
              r = parseInt(hex.substring(0, 2), 16);
              g = parseInt(hex.substring(2, 4), 16);
              b = parseInt(hex.substring(4, 6), 16);
            } else if (hex.length === 3) {
              r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
              g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
              b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
            }

            await sharp({
              create: {
                width: 1080,
                height: 1920,
                channels: 4,
                background: { r, g, b, alpha: 1 }
              }
            })
            .png()
            .toFile(tempImagePath);
          }
        }
      }

      if (storyText) {
        const finalTempPath = path.join(outDir, `temp_overlay_${Date.now()}.png`);
        const metadata = await sharp(tempImagePath).metadata();
        const width = metadata.width || 1080;
        const height = metadata.height || 1920;

        const overlayBuffer = await this.createOverlayPng(width, height, storyText, {
          color: storyTextColor,
          bg: storyTextBg,
          size: storyTextSize,
          position: storyTextPosition
        });

        await sharp(tempImagePath)
          .composite([{ input: overlayBuffer, top: 0, left: 0 }])
          .toFile(finalTempPath);

        if (tempImagePath !== inputPath) {
          try { fs.unlinkSync(tempImagePath); } catch (e) {}
        }
        tempImagePath = finalTempPath;
      }

      if (audioUrl) {
        try {
          await this.compileImageAndAudioToVideo(tempImagePath, audioUrl, outputPath, 15);
          if (tempImagePath !== inputPath) {
            try { fs.unlinkSync(tempImagePath); } catch (e) {}
          }
          return outputPath;
        } catch (err) {
          console.error("Failed to compile image and audio to video, saving image fallback:", err);
          const isOutputJpg = outputPath.toLowerCase().endsWith('.jpg') || outputPath.toLowerCase().endsWith('.jpeg');
          if (isOutputJpg) {
            await sharp(tempImagePath).jpeg({ quality: 95 }).toFile(outputPath);
          } else {
            await sharp(tempImagePath).toFile(outputPath);
          }
          if (tempImagePath !== inputPath) {
            try { fs.unlinkSync(tempImagePath); } catch (e) {}
          }
          return outputPath;
        }
      } else {
        const isOutputJpg = outputPath.toLowerCase().endsWith('.jpg') || outputPath.toLowerCase().endsWith('.jpeg');
        if (isOutputJpg) {
          await sharp(tempImagePath).jpeg({ quality: 95 }).toFile(outputPath);
          if (tempImagePath !== inputPath) {
            try { fs.unlinkSync(tempImagePath); } catch (e) {}
          }
        } else {
          if (tempImagePath !== inputPath) {
            fs.renameSync(tempImagePath, outputPath);
          } else {
            fs.copyFileSync(inputPath, outputPath);
          }
        }
        return outputPath;
      }

    } else {
      let tempVideoPath = inputPath;

      if (isVerticalFormat) {
        tempVideoPath = path.join(outDir, `temp_norm_${Date.now()}.mp4`);
        await this.normalizeForStoryInternal(inputPath, tempVideoPath);
      }

      let overlayPngPath = '';
      if (storyText) {
        overlayPngPath = path.join(outDir, `overlay_text_${Date.now()}.png`);
        const overlayBuffer = await this.createOverlayPng(1080, 1920, storyText, {
          color: storyTextColor,
          bg: storyTextBg,
          size: storyTextSize,
          position: storyTextPosition
        });
        fs.writeFileSync(overlayPngPath, overlayBuffer);
      }

      try {
        await this.processVideoFFmpeg(tempVideoPath, overlayPngPath, audioUrl, outputPath);
      } finally {
        if (tempVideoPath !== inputPath) {
          try { fs.unlinkSync(tempVideoPath); } catch (e) {}
        }
        if (overlayPngPath) {
          try { fs.unlinkSync(overlayPngPath); } catch (e) {}
        }
      }
      return outputPath;
    }
  }

  async createOverlayPng(width, height, text, options) {
    const { color = '#ffffff', bg = 'rgba(0,0,0,0.6)', size = 'md', position = 'center' } = options;

    let fontSize = Math.round(width * 0.045);
    if (size === 'sm') fontSize = Math.round(width * 0.035);
    if (size === 'lg') fontSize = Math.round(width * 0.06);

    let yPx = Math.round(height * 0.5);
    let textAnchor = 'middle';

    if (position === 'top') {
      yPx = Math.round(height * 0.15);
    } else if (position === 'bottom') {
      yPx = Math.round(height * 0.85);
    } else if (position === 'top-left' || position === 'top_left' || position === 'top left') {
      yPx = Math.round(height * 0.15); textAnchor = 'start';
    } else if (position === 'top-right' || position === 'top_right' || position === 'top right') {
      yPx = Math.round(height * 0.15); textAnchor = 'end';
    } else if (position === 'bottom-left' || position === 'bottom_left' || position === 'bottom left') {
      yPx = Math.round(height * 0.85); textAnchor = 'start';
    } else if (position === 'bottom-right' || position === 'bottom_right' || position === 'bottom right') {
      yPx = Math.round(height * 0.85); textAnchor = 'end';
    }

    const measureText = (str) => {
      let w = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (/[A-Z@#%&MW]/.test(char)) w += fontSize * 0.7;
        else if (/[ijl1.,!i|:\-']/.test(char)) w += fontSize * 0.3;
        else w += fontSize * 0.55;
      }
      return w;
    };

    const segments = [];
    const emojiRegex = /([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu;
    let match;
    let lastIndex = 0;
    while ((match = emojiRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      segments.push({ type: 'emoji', content: match[0] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ type: 'text', content: text.substring(lastIndex) });
    }

    let totalWidth = 0;
    for (const seg of segments) {
      if (seg.type === 'text') seg.width = measureText(seg.content);
      else seg.width = fontSize * 1.1;
      totalWidth += seg.width;
    }

    let startX = Math.round(width * 0.5) - (totalWidth / 2);
    if (textAnchor === 'start') startX = Math.round(width * 0.1);
    else if (textAnchor === 'end') startX = Math.round(width * 0.9) - totalWidth;

    let elementsSvg = '';
    let currentX = startX;

    for (const seg of segments) {
      if (seg.type === 'text') {
        const escaped = seg.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        elementsSvg += `<text x="${currentX}" y="${yPx}" dominant-baseline="middle" class="text-layer">${escaped}</text>`;
        currentX += seg.width;
      } else {
        try {
          let codePoints = Array.from(seg.content).map(c => c.codePointAt(0).toString(16));
          if (!codePoints.includes('20e3')) codePoints = codePoints.filter(c => c !== 'fe0f');
          const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codePoints.join('-')}.svg`;
          const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 3000 });
          const b64 = Buffer.from(res.data).toString('base64');
          const emojiSize = Math.round(fontSize * 1.05);
          const emojiY = yPx - Math.round(emojiSize / 2);
          elementsSvg += `<image x="${currentX}" y="${emojiY}" width="${emojiSize}" height="${emojiSize}" href="data:image/svg+xml;base64,${b64}" />`;
        } catch (e) {
          elementsSvg += `<text x="${currentX}" y="${yPx}" dominant-baseline="middle" class="text-layer">${seg.content}</text>`;
        }
        currentX += seg.width;
      }
    }

    let svgBackground = '';
    const resolvedBg = (bg && bg !== 'transparent') ? bg : '';
    if (resolvedBg) {
      const rectHeight = Math.round(fontSize * 1.8);
      const rectY = yPx - Math.round(rectHeight / 2);
      let rectX, rectWidth;
      if (textAnchor === 'start') {
        rectX = Math.round(width * 0.08); rectWidth = Math.round(width * 0.60);
      } else if (textAnchor === 'end') {
        rectX = Math.round(width * 0.32); rectWidth = Math.round(width * 0.60);
      } else {
        rectX = Math.round(width * 0.05); rectWidth = Math.round(width * 0.90);
      }
      svgBackground = `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${resolvedBg}" rx="36" ry="36" />`;
    }

    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .text-layer { fill: ${color}; font-size: ${fontSize}px; font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif; font-weight: bold; }
        </style>
        ${svgBackground}
        ${elementsSvg}
      </svg>
    `;

    return sharp(Buffer.from(svgContent)).png().toBuffer();
  }

  async normalizeForStoryInternal(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const args = [
        '-y',
        '-i', inputPath,
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputPath
      ];

      const ffmpeg = spawn(ffmpegStatic, args);
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(outputPath);
        else reject(new Error(`FFmpeg story normalization failed with exit code ${code}`));
      });
      ffmpeg.on('error', reject);
    });
  }

  async compileImageAndAudioToVideo(imagePath, audioUrl, outputPath, duration = 15) {
    return new Promise((resolve, reject) => {

      const args = [
        '-y',
        '-loop', '1',
        '-i', imagePath,
        '-i', audioUrl,
        '-vf', "scale='trunc(iw/2)*2':'trunc(ih/2)*2',format=yuv420p",
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-ac', '2',
        '-pix_fmt', 'yuv420p',
        '-t', duration.toString(),
        '-shortest',
        outputPath
      ];

      const ffmpeg = spawn(ffmpegStatic, args);
      let stderrLog = '';

      ffmpeg.stderr.on('data', (chunk) => {
        stderrLog += chunk.toString();
        if (stderrLog.length > 30000) {
          stderrLog = stderrLog.slice(-10000);
        }
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          console.error('FFmpeg compile error log:', stderrLog);
          reject(new Error(`FFmpeg video compilation failed with exit code ${code}. Stderr: ${stderrLog}`));
        }
      });

      ffmpeg.on('error', (err) => {
        console.error('FFmpeg compile process error:', err);
        reject(new Error(`FFmpeg spawn failed: ${err.message}. Stderr: ${stderrLog}`));
      });
    });
  }

  async processVideoFFmpeg(videoPath, overlayPngPath, audioUrl, outputPath) {
    return new Promise((resolve, reject) => {
      const inputs = ['-y', '-i', videoPath];
      let inputIndex = 1;

      if (overlayPngPath) {
        inputs.push('-i', overlayPngPath);
        inputIndex++;
      }

      const musicInputIndex = inputIndex;
      if (audioUrl) {
        inputs.push('-i', audioUrl);
      }

      const args = [...inputs];

      const filterParts = [];
      let videoMapLabel = '0:v';
      let audioMapLabel = null;

      if (overlayPngPath) {
        filterParts.push('[0:v][1:v]overlay=0:0[v]');
        videoMapLabel = '[v]';
      }

      if (audioUrl) {
        filterParts.push(
          `anullsrc=r=44100:cl=stereo[silence];[silence][${musicInputIndex}:a]amix=inputs=2:duration=shortest:dropout_transition=0[aout]`
        );
        audioMapLabel = '[aout]';
      }

      if (filterParts.length > 0) {
        args.push('-filter_complex', filterParts.join(';'));
      }

      args.push('-map', videoMapLabel);

      if (audioMapLabel) {
        args.push('-map', audioMapLabel);
      } else {
        args.push('-map', '0:a?');
      }

      args.push(
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-ac', '2',
        outputPath
      );

      const ffmpeg = spawn(ffmpegStatic, args);
      let errLog = '';
      ffmpeg.stderr.on('data', (data) => {
        errLog += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(outputPath);
        else reject(new Error(`FFmpeg video processing failed with code ${code}. Log: ${errLog}`));
      });
      ffmpeg.on('error', reject);
    });
  }


  async replaceVideoAudio(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      const args = [
        '-y',
        '-i', videoPath,
        '-i', audioPath,
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        outputPath,
      ];

      const ffmpeg = spawn(ffmpegStatic, args);
      let errLog = '';
      ffmpeg.stderr.on('data', (data) => {
        errLog += data.toString();
      });
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(outputPath);
        else reject(new Error(`FFmpeg replace audio failed (${code}): ${errLog}`));
      });
      ffmpeg.on('error', reject);
    });
  }

  async burnSubtitleStyle(videoPath, subtitleText, style = 'bottom', outputPath) {
    const escaped = (subtitleText || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .replace(/\n/g, ' ')
      .slice(0, 280);

    let drawtext = '';
    switch (style) {
      case 'bold':
        drawtext = `drawtext=text='${escaped}':fontsize=28:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=(h-text_h)/2`;
        break;
      case 'minimal':
        drawtext = `drawtext=text='${escaped}':fontsize=20:fontcolor=white@0.9:box=1:boxcolor=black@0.35:boxborderw=8:x=(w-text_w)/2:y=h-th-48`;
        break;
      case 'karaoke':
        drawtext = `drawtext=text='${escaped}':fontsize=24:fontcolor=yellow:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-th-80`;
        break;
      case 'bottom':
      default:
        drawtext = `drawtext=text='${escaped}':fontsize=22:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-th-32`;
        break;
    }

    return new Promise((resolve, reject) => {
      const args = [
        '-y',
        '-i', videoPath,
        '-vf', drawtext,
        '-c:a', 'copy',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        outputPath,
      ];

      const ffmpeg = spawn(ffmpegStatic, args);
      let errLog = '';
      ffmpeg.stderr.on('data', (data) => {
        errLog += data.toString();
      });
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(outputPath);
        else reject(new Error(`FFmpeg subtitle burn failed (${code}): ${errLog}`));
      });
      ffmpeg.on('error', reject);
    });
  }

  async normalizeForStory(inputPath, outputPath) {
    return this.normalizeForStoryInternal(inputPath, outputPath);
  }

  isImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  }

  async addStoryTextToImage(inputPath, outputPath, options) {
    const { storyText, storyTextColor, storyTextBg, storyTextSize, storyTextPosition } = options;

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const width = metadata.width || 1080;
    const height = metadata.height || 1920;

    const textColor = storyTextColor || '#ffffff';
    let textBg = storyTextBg || 'rgba(0,0,0,0.6)';
    if (textBg === 'none' || !textBg) textBg = 'transparent';

    let fontSize = Math.round(height * 0.035);
    if (storyTextSize === 'sm') fontSize = Math.round(height * 0.025);
    if (storyTextSize === 'lg') fontSize = Math.round(height * 0.05);

    const escapeXml = (unsafe) => unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });

    const maxCharsPerLine = Math.floor(width / (fontSize * 0.6));
    const words = storyText.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + word).length > maxCharsPerLine) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    }
    if (currentLine) lines.push(currentLine.trim());

    const lineHeight = fontSize * 1.3;
    const paddingX = fontSize;
    const paddingY = fontSize * 0.8;
    
    const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, '');
    const boxWidth = Math.min((longestLine.length * (fontSize * 0.65)) + (paddingX * 2), width * 0.95);
    const boxHeight = (lines.length * lineHeight) + (paddingY * 2);

    let x = width / 2;
    let y = height / 2;
    const margin = height * 0.08;
    
    const pos = (storyTextPosition || 'center').replace(/[_ ]/g, '-').toLowerCase();

    if (pos === 'top') {
        y = margin + (boxHeight / 2);
    } else if (pos === 'bottom') {
        y = height - margin - (boxHeight / 2);
    } else if (pos === 'top-left') {
        x = paddingX + (boxWidth / 2);
        y = margin + (boxHeight / 2);
    } else if (pos === 'top-right') {
        x = width - paddingX - (boxWidth / 2);
        y = margin + (boxHeight / 2);
    } else if (pos === 'bottom-left') {
        x = paddingX + (boxWidth / 2);
        y = height - margin - (boxHeight / 2);
    } else if (pos === 'bottom-right') {
        x = width - paddingX - (boxWidth / 2);
        y = height - margin - (boxHeight / 2);
    }

    const boxX = Math.max(0, x - (boxWidth / 2));
    const boxY = Math.max(0, y - (boxHeight / 2));
    const textX = boxWidth / 2;

    let tspans = '';
    lines.forEach((line, index) => {
        const lineY = (index * lineHeight) + paddingY + (fontSize * 0.8);
        tspans += `<text x="${textX}" y="${lineY}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}px" font-weight="900" fill="${textColor}" text-anchor="middle">${escapeXml(line.toUpperCase())}</text>`;
    });

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${boxX}, ${boxY})">
        <rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" fill="${textBg}" rx="12" />
        ${tspans}
      </g>
    </svg>`;

    await image
      .composite([{
          input: Buffer.from(svg),
          top: 0,
          left: 0
      }])
      .toFile(outputPath);
      
    return outputPath;
  }
}

module.exports = new MediaProcessor();
