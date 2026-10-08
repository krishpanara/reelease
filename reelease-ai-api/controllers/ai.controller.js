const { db } = require('../models');
const AIProvider = db.AIProvider;
const AITask = db.AITask;
const AIFeatureCredit = db.AIFeatureCredit;
const User = db.User;
const Setting = db.Setting;
const Attachment = db.Attachment;
const Role = db.Role;
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId).populate('roleId');
    return user?.roleId?.name === 'super_admin' || user?.roleId?.name === 'admin';
  } catch (error) {
    return false;
  }
};
const { downloadAndProcessMedia } = require('../utils/watermark-helper');

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  const parts = path.replace(/\[(\w+)\]/g, '.$1').split('.');
  return parts.reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (typeof acc === 'string') {
      try { acc = JSON.parse(acc); } catch (e) { return undefined; }
    }
    return acc[part];
  }, obj);
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Kie.ai File Upload API hosts (docs list both; the first one that answers is used).
const KIE_UPLOAD_HOSTS = [
  process.env.KIE_UPLOAD_BASE_URL,
  'https://kieai.redpandaai.co',
  'https://api.kie.ai',
].filter(Boolean);

const isKieProvider = (providerConfig) => /kie\.ai/i.test(providerConfig?.base_url || '');

/**
 * Returns the local file path when `url` points at this server's /uploads folder
 * (relative path, localhost, or a private-network host) — i.e. a URL an external
 * AI provider cannot download. Returns null for public URLs.
 */
const getLocalUploadPath = (url) => {
  if (!url || typeof url !== 'string') return null;
  let pathname;
  if (/^https?:\/\//i.test(url)) {
    let parsed;
    try { parsed = new URL(url); } catch { return null; }
    const host = parsed.hostname;
    const isPrivate = host === 'localhost' || host === '::1' || host === '[::1]' || /^127\./.test(host) ||
      /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || !host.includes('.');
    if (!isPrivate) return null;
    pathname = parsed.pathname;
  } else {
    pathname = url;
  }
  pathname = decodeURIComponent(pathname.replace(/\\/g, '/')).replace(/\/{2,}/g, '/').replace(/^\/?api\//, '/');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;
  if (!pathname.startsWith('/uploads/')) return null;
  const filePath = path.join(__dirname, '..', pathname);
  // Stay inside the uploads folder.
  if (!filePath.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(filePath)) return null;
  return filePath;
};

/** Uploads a local file to Kie.ai's temporary file storage and returns its public download URL. */
const uploadToKie = async (filePath, apiKey) => {
  const FormData = require('form-data');
  let lastError;
  for (const host of KIE_UPLOAD_HOSTS) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('uploadPath', 'reelease-ai');
      form.append('fileName', `${Date.now()}-${path.basename(filePath)}`);
      const { data } = await axios.post(`${host.replace(/\/$/, '')}/api/file-stream-upload`, form, {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${apiKey}` },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      });
      const downloadUrl = data?.data?.downloadUrl;
      if (data?.success !== false && downloadUrl) return downloadUrl;
      lastError = new Error(data?.msg || 'Kie.ai file upload returned no download URL');
      // Auth/balance errors will fail on every host — stop early.
      if ([401, 402, 403].includes(Number(data?.code))) break;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      if (status && ![404, 405].includes(status) && status < 500) break;
    }
  }
  throw lastError || new Error('Kie.ai file upload failed');
};

/** Gives back credits taken for a generation that did not start or did not finish. */
const refundCredits = async (userId, creditCost, topUpDeduction) => {
  if (!creditCost) return;
  try {
    await User.findByIdAndUpdate(userId, {
      $inc: { used_credits: -creditCost, top_up_credits: topUpDeduction || 0 },
    });
  } catch (err) {
    console.error('Credit refund failed:', err.message);
  }
};

const parseWatermarkFlag = (body = {}) => {
  const values = [
    body.addWatermark,
    body.allowWatermark,
    body.add_watermark,
    body.allow_watermark,
  ];
  return values.some((v) => v === true || v === 'true' || v === 1 || v === '1');
};

exports.generateMedia = async (req, res) => {
  // Set once credits are deducted, so every failure path below can refund them.
  let creditsCharged = null;
  try {
    const {
      serviceType, prompt,
      referenceUrl, attachmentId,
      referenceUrls, attachmentIds, imageUrl, imageUrls, videoUrl, videoAttachmentId,
      aspectRatio, resolution, duration,
      sound, mode, multiShots, multiPrompt, klingElements, numImages, n,
      backgroundMusicUrl, backgroundMusicPath, addSubtitles, subtitleStyle,
      videoQuality, renderingMode, voice, language, seed,
      autoSceneBreakdown, addBackgroundMusic, enhanceVisuals
    } = req.body;

    const wantsWatermark = parseWatermarkFlag(req.body);
    const customMusic = backgroundMusicUrl || backgroundMusicPath;

    const user = await User.findById(req.user._id).populate('plan_id');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const userIsAdmin = await isAdmin(user._id);
    if (user.plan_id && !userIsAdmin && !req.user.hasRolePermission) {
      const featureToCheck = req.body.overrideServiceType || serviceType;
      const featureEnabled = user.plan_id.ai_features?.[featureToCheck];
      if (featureEnabled === false) {
        return res.status(403).json({ message: `Your current plan and role do not support ${featureToCheck.replace(/_/g, ' ')}.` });
      }
    }

    const setting = await Setting.findOne();
    let providerId = setting?.active_ai_provider_id;

    if (!providerId) {
      const firstProvider = await AIProvider.findOne();
      if (!firstProvider) return res.status(400).json({ message: 'No AI providers configured.' });
      providerId = firstProvider._id;
    }

    const provider = await AIProvider.findById(providerId);
    if (!provider || !provider[serviceType] || !provider[serviceType].enabled) {
      return res.status(400).json({ message: 'Selected service is not enabled for this provider.' });
    }

    const providerConfig = provider[serviceType];

    const featureCredit = await AIFeatureCredit.findOne({ provider_id: providerId, feature_key: serviceType });
    const featureCost = req.body.overrideCreditCost !== undefined ? req.body.overrideCreditCost : (featureCredit ? featureCredit.credits : 0);
    // Admins are not limited by credits, so they are not charged either (their balance would go negative).
    const creditCost = userIsAdmin ? 0 : featureCost;

    const remainingCredits = user.total_credits - user.used_credits;
    if (!userIsAdmin && remainingCredits < creditCost) {
      return res.status(400).json({ message: 'Insufficient credits.' });
    }

    const resolveAttachment = async (id) => {
      const attachment = await Attachment.findById(id);
      if (!attachment) return null;
      const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      return attachment.file_path.startsWith('http')
        ? attachment.file_path
        : `${cleanBaseUrl}${attachment.file_path.startsWith('/') ? '' : '/'}${attachment.file_path}`;
    };

    const finalReferenceUrls = [];
    if (referenceUrl) finalReferenceUrls.push(referenceUrl);
    if (imageUrl) finalReferenceUrls.push(imageUrl);
    if (referenceUrls) {
      if (Array.isArray(referenceUrls)) finalReferenceUrls.push(...referenceUrls);
      else finalReferenceUrls.push(referenceUrls);
    }
    if (imageUrls) {
      if (Array.isArray(imageUrls)) finalReferenceUrls.push(...imageUrls);
      else finalReferenceUrls.push(imageUrls);
    }

    if (attachmentId) {
      const resolved = await resolveAttachment(attachmentId);
      if (resolved) finalReferenceUrls.push(resolved);
    }
    if (attachmentIds) {
      const ids = Array.isArray(attachmentIds) ? attachmentIds : [attachmentIds];
      for (const id of ids) {
        const resolved = await resolveAttachment(id);
        if (resolved) finalReferenceUrls.push(resolved);
      }
    }

    let finalVideoUrl = videoUrl;
    if (videoAttachmentId) {
      const resolved = await resolveAttachment(videoAttachmentId);
      if (resolved) finalVideoUrl = resolved;
    }

    if (!(providerConfig.api_key || '').trim()) {
      return res.status(400).json({
        message: `The AI provider API key is not configured for ${serviceType.replace(/_/g, ' ')}. An admin must add it under AI Providers.`,
      });
    }

    // The provider downloads reference media itself, so files stored on this server
    // (localhost / private network) must first be uploaded to Kie.ai's file storage.
    if (isKieProvider(providerConfig)) {
      try {
        for (let i = 0; i < finalReferenceUrls.length; i++) {
          const localPath = getLocalUploadPath(finalReferenceUrls[i]);
          if (localPath) finalReferenceUrls[i] = await uploadToKie(localPath, providerConfig.api_key.trim());
        }
        const localVideoPath = getLocalUploadPath(finalVideoUrl);
        if (localVideoPath) finalVideoUrl = await uploadToKie(localVideoPath, providerConfig.api_key.trim());
      } catch (err) {
        console.error('Kie.ai reference upload error:', err.response ? JSON.stringify(err.response.data) : err.message);
        return res.status(502).json({
          message: `Could not send your reference file to the AI provider: ${err.response?.data?.msg || err.message}`,
        });
      }
    }

    const topUpDeduction = Math.min(creditCost, user.top_up_credits || 0);
    user.top_up_credits = (user.top_up_credits || 0) - topUpDeduction;
    user.used_credits += creditCost;
    await user.save();
    creditsCharged = { creditCost, topUpDeduction };

    const finalResolution = (resolution || "1K");
    let finalAspectRatio = (aspectRatio || "16:9").toString().replace('x', ':').trim();

    if (finalAspectRatio.includes(':')) {
      const parts = finalAspectRatio.split(':');
      if (parts.length === 2 && parts[1].length > 1 && parts[0] === '1' && parts[1].startsWith('1')) {

        finalAspectRatio = finalAspectRatio.trim();
      }
    }
    const finalDuration = duration ? duration.toString().replace('s', '') : "5";
    const finalSound = customMusic ? false : (sound === undefined ? false : sound);
    const finalMode = mode || "std";
    const finalMultiShots = multiShots === undefined ? false : multiShots;
    const finalMultiPrompt = multiPrompt || [];
    const finalKlingElements = klingElements || [];

    const escapedPrompt = (prompt || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    let payloadStr = providerConfig.create_job_request.payload;
    payloadStr = payloadStr.replace(/\{\{\s*prompt\s*\}\}/g, escapedPrompt);
    payloadStr = payloadStr.replace(/\{\{\s*text\s*\}\}/g, escapedPrompt);
    payloadStr = payloadStr.replace(/\{\{\s*aspect_ratio\s*\}\}/g, finalAspectRatio);
    payloadStr = payloadStr.replace(/\{\{\s*resolution\s*\}\}/g, finalResolution);
    payloadStr = payloadStr.replace(/\{\{\s*duration\s*\}\}/g, finalDuration);
    payloadStr = payloadStr.replace(/\{\{\s*sound\s*\}\}/g, finalSound);
    payloadStr = payloadStr.replace(/\{\{\s*mode\s*\}\}/g, finalMode);
    payloadStr = payloadStr.replace(/\{\{\s*multi_shots\s*\}\}/g, finalMultiShots);
    payloadStr = payloadStr.replace(/\"\{\{\s*multi_prompt\s*\}\}\"|\{\{\s*multi_prompt\s*\}\}/g, JSON.stringify(finalMultiPrompt));
    payloadStr = payloadStr.replace(/\"\{\{\s*kling_elements\s*\}\}\"|\{\{\s*kling_elements\s*\}\}/g, JSON.stringify(finalKlingElements));

    const finalNumImages = numImages || n || 1;
    payloadStr = payloadStr.replace(/\{\{\s*num\s*\}\}/g, finalNumImages);
    payloadStr = payloadStr.replace(/\{\{\s*n\s*\}\}/g, finalNumImages);
    payloadStr = payloadStr.replace(/\{\{\s*num_images\s*\}\}/g, finalNumImages);

    if (finalReferenceUrls.length > 0) {
      payloadStr = payloadStr.replace(/\"\{\{\s*reference_urls\s*\}\}\"|\{\{\s*reference_urls\s*\}\}/g, JSON.stringify(finalReferenceUrls));
      payloadStr = payloadStr.replace(/\{\{\s*reference_url\s*\}\}/g, finalReferenceUrls[0]);
      payloadStr = payloadStr.replace(/\{\{\s*image_url\s*\}\}/g, finalReferenceUrls[0]);
    } else {
      payloadStr = payloadStr.replace(/\"\{\{\s*reference_urls\s*\}\}\"|\{\{\s*reference_urls\s*\}\}/g, '[]');
      payloadStr = payloadStr.replace(/\{\{\s*reference_url\s*\}\}/g, '');
      payloadStr = payloadStr.replace(/\{\{\s*image_url\s*\}\}/g, '');
    }

    if (finalVideoUrl) {
      payloadStr = payloadStr.replace(/\{\{\s*video_url\s*\}\}/g, finalVideoUrl);
    } else {
      payloadStr = payloadStr.replace(/\{\{\s*video_url\s*\}\}/g, '');
    }

    let payloadObj;
    try {
      payloadObj = JSON.parse(payloadStr);
      if (payloadObj && payloadObj.input) {
        if (finalMultiShots === true) {
          if (finalMultiPrompt.length > 0) delete payloadObj.input.prompt;
        } else {
          delete payloadObj.input.multi_prompt;
        }
        if (finalKlingElements.length === 0) delete payloadObj.input.kling_elements;
      }
    } catch (e) { payloadObj = payloadStr; }

    const headers = {
      'Content-Type': 'application/json'
    };
    const apiKey = (providerConfig.api_key || '').trim();
    if (providerConfig.auth_type?.includes('Bearer')) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (providerConfig.auth_type === 'Header Key') {
      headers['x-api-key'] = apiKey;
    } else {
      headers['Authorization'] = apiKey;
    }

    const apiUrl = `${providerConfig.base_url.replace(/\/$/, '')}/${providerConfig.create_job_request.endpoint.replace(/^\//, '')}`;

    const response = await axios({
      method: providerConfig.create_job_request.method || 'POST',
      url: apiUrl,
      headers,
      data: payloadObj
    });

    const taskId = getNestedValue(response.data, providerConfig.create_job_request.job_id_path);
    if (!taskId) {
      const providerError = response.data?.msg || response.data?.message || 'taskId missing from provider response';
      await refundCredits(user._id, creditsCharged.creditCost, creditsCharged.topUpDeduction);
      return res.status(500).json({
        message: `AI Provider Error: ${providerError}`,
        data: response.data
      });
    }

    const newTask = new AITask({
      user_id: user._id,
      provider_id: providerId,
      service_type: req.body.overrideServiceType || serviceType,
      task_id: taskId,
      status: 'running',
      credits_used: creditCost,
      payload: {
        ...(typeof payloadObj === 'object' && payloadObj !== null ? payloadObj : {}),
        ...(req.body.extraPayload && typeof req.body.extraPayload === 'object' ? req.body.extraPayload : {}),
        prompt: prompt || (payloadObj?.input?.prompt),
        aspectRatio: finalAspectRatio,
        duration: finalDuration,
        sound: finalSound,
        mode: finalMode,
        videoQuality: videoQuality || null,
        renderingMode: renderingMode || null,
        voice: voice || null,
        language: language || null,
        seed: seed || null,
        autoSceneBreakdown: autoSceneBreakdown === true || autoSceneBreakdown === 'true',
        addBackgroundMusic: addBackgroundMusic === true || addBackgroundMusic === 'true' || Boolean(customMusic),
        enhanceVisuals: enhanceVisuals === true || enhanceVisuals === 'true',
        backgroundMusicUrl: backgroundMusicUrl || null,
        backgroundMusicPath: backgroundMusicPath || null,
        addSubtitles: addSubtitles === true || addSubtitles === 'true',
        subtitleStyle: subtitleStyle || null,
        addWatermark: wantsWatermark,
        allowWatermark: wantsWatermark,
      },
      provider_config: providerConfig
    });
    await newTask.save();

    res.status(200).json({
      success: true,
      message: 'AI Generation started successfully.',
      taskId,
      credits_remaining: user.total_credits - user.used_credits
    });

    if (providerConfig.poll_job_status?.endpoint) {
      (async () => {
        const io = req.app.get('io');
        const pollUrl = `${providerConfig.base_url.replace(/\/$/, '')}/${providerConfig.poll_job_status.endpoint.replace(/^\//, '').replace('{{taskId}}', taskId)}`;

        let finalMediaUrl = null;
        let maxRetries = 120;
        let attempt = 0;

        while (attempt < maxRetries) {
          await delay(10000);
          attempt++;
          try {
            const pollResponse = await axios({ method: providerConfig.poll_job_status.method || 'GET', url: pollUrl, headers });
            const currentState = getNestedValue(pollResponse.data, providerConfig.poll_job_status.state_path);

            if (currentState == providerConfig.poll_job_status.success_state_value) {
              finalMediaUrl = getNestedValue(pollResponse.data, providerConfig.poll_job_status.result_media_url_path);
              break;
            } else if (currentState == providerConfig.poll_job_status.failed_state_value) {
              const failMsg = pollResponse.data?.data?.failMsg || 'Provider reported failure';
              await AITask.findOneAndUpdate({ task_id: taskId }, { status: 'failed', error_message: failMsg });
              await refundCredits(user._id, creditsCharged.creditCost, creditsCharged.topUpDeduction);
              const errorPayload = { taskId, status: 'failed', message: failMsg };
              if (io) io.emit(`ai-task-${user._id}`, errorPayload);
              return;
            }
          } catch (err) { console.error(`Poll error ${taskId}:`, err.message); }
        }

        if (finalMediaUrl) {
          await downloadAndProcessMedia(taskId, finalMediaUrl, user._id, req);
        } else {
          await AITask.findOneAndUpdate({ task_id: taskId }, { status: 'failed', error_message: 'Polling timed out' });
          await refundCredits(user._id, creditsCharged.creditCost, creditsCharged.topUpDeduction);
          const timeoutPayload = { taskId, status: 'failed', message: 'Polling timed out' };
          if (io) io.emit(`ai-task-${user._id}`, timeoutPayload);
        }
      })();
    } else {
      const immediateMediaUrl = getNestedValue(response.data, providerConfig.poll_job_status?.result_media_url_path || 'data.url');
      if (immediateMediaUrl) {
        (async () => {
          await downloadAndProcessMedia(taskId, immediateMediaUrl, user._id, req);
        })();
      }
    }

  } catch (error) {
    console.error('AI Generation error:', error.response ? JSON.stringify(error.response.data) : error.message);
    if (!res.headersSent) {
      if (creditsCharged) await refundCredits(req.user._id, creditsCharged.creditCost, creditsCharged.topUpDeduction);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || error.response?.data?.msg || error.message,
        status: error.response?.status,
        error: error.response?.data
      });
    }
  }
};

exports.getUsageLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, serviceType, status } = req.query;
    const query = { user_id: req.user._id };

    if (serviceType) query.service_type = serviceType;
    if (status) query.status = status;

    const logs = await AITask.find(query)
      .populate('attachment_id')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AITask.countDocuments(query);

    res.status(200).json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get AI Usage Logs error:', error);
    res.status(500).json({ message: error.message, status: error.response?.status });
  }
};

exports.saveToMedia = async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await AITask.findOne({ task_id: taskId, user_id: req.user._id });

    if (!task || task.status !== 'completed' || !task.result_url) {
      return res.status(400).json({ message: 'Result not ready or not found.' });
    }

    if (task.attachment_id) {
      return res.status(200).json({ message: 'Already saved to media.', attachment_id: task.attachment_id });
    }

    const filePath = path.join(__dirname, '..', task.result_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found.' });
    }

    const stats = fs.statSync(filePath);
    const extension = path.extname(filePath).substring(1);

    const newAttachment = new Attachment({
      name: path.basename(filePath),
      file_path: task.result_url,
      file_type: ['mp4', 'mov', 'avi'].includes(extension) ? 'video' : 'image',
      file_size: stats.size,
      mime_type: ['mp4', 'mov', 'avi'].includes(extension) ? 'video/mp4' : 'image/jpeg',
      is_generated: true,
      created_by: req.user._id
    });

    await newAttachment.save();
    task.attachment_id = newAttachment._id;
    await task.save();

    res.status(201).json({
      message: 'Saved to media successfully.',
      attachment: newAttachment
    });
  } catch (error) {
    console.error('Save to Media error:', error);
    res.status(500).json({ message: error.message, status: error.response?.status });
  }
};
