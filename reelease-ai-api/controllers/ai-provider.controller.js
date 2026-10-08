const { db } = require('../models');
const AIProvider = db.AIProvider;
const AITask = db.AITask;
const axios = require('axios');
const { downloadAndProcessMedia } = require('../utils/watermark-helper');

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  const parts = path.replace(/\[(\w+)\]/g, '.$1').split('.');
  return parts.reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (typeof acc === 'string') {
      try {
        acc = JSON.parse(acc);
      } catch (e) {
        return undefined;
      }
    }
    return acc[part];
  }, obj);
};

const delay = ms => new Promise(res => setTimeout(res, ms));

exports.createProvider = async (req, res) => {
  try {
    const { name, text_to_image, image_to_image, video_motion, images_to_video, text_to_video } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Provider name is required.' });
    }

    const provider = new AIProvider({
      name,
      text_to_image,
      image_to_image,
      video_motion,
      images_to_video,
      text_to_video
    });

    await provider.save();

    res.status(201).json({
      message: 'AI Provider created successfully.',
      provider
    });
  } catch (error) {
    console.error('Create AI Provider error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProviders = async (req, res) => {
  try {
    const providers = await AIProvider.find().sort({ created_at: -1 });
    res.status(200).json({
      message: 'Providers fetched successfully.',
      providers
    });
  } catch (error) {
    console.error('Get AI Providers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const provider = await AIProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }
    res.status(200).json({
      message: 'Provider fetched successfully.',
      provider
    });
  } catch (error) {
    console.error('Get AI Provider error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProvider = async (req, res) => {
  try {
    const { name, text_to_image, image_to_image, video_motion, images_to_video, text_to_video } = req.body;

    const provider = await AIProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    if (name) provider.name = name;
    if (text_to_image !== undefined) provider.text_to_image = text_to_image;
    if (image_to_image !== undefined) provider.image_to_image = image_to_image;
    if (video_motion !== undefined) provider.video_motion = video_motion;
    if (images_to_video !== undefined) provider.images_to_video = images_to_video;
    if (text_to_video !== undefined) provider.text_to_video = text_to_video;

    await provider.save();

    res.status(200).json({
      message: 'AI Provider updated successfully.',
      provider
    });
  } catch (error) {
    console.error('Update AI Provider error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskStatus = async (req, res) => {
  try {
    const task = await AITask.findOne({ task_id: req.params.taskId })
      .select('-provider_config -payload')
      .populate('attachment_id');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Get Task Status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProvider = async (req, res) => {
  try {
    const provider = await AIProvider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    res.status(200).json({
      message: 'AI Provider deleted successfully.'
    });
  } catch (error) {
    console.error('Delete AI Provider error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.testProvider = async (req, res) => {
  try {
    let {
      providerId, serviceType, prompt,
      referenceUrl, attachmentId,
      referenceUrls, attachmentIds,
      videoUrl, videoAttachmentId,
      aspectRatio, resolution, duration,
      sound, mode, multiShots, multiPrompt, klingElements,
      apiKey
    } = req.body;

    if (!prompt && !referenceUrl && !attachmentId && !videoUrl && !videoAttachmentId && !referenceUrls && !attachmentIds) {
      return res.status(400).json({ message: 'Prompt, referenceUrl, attachmentId, videoUrl or videoAttachmentId is required for testing.' });
    }

    const resolveAttachment = async (id) => {
      const Attachment = db.Attachment;
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
    if (Array.isArray(referenceUrls)) finalReferenceUrls.push(...referenceUrls);

    if (attachmentId) {
      const resolved = await resolveAttachment(attachmentId);
      if (resolved) finalReferenceUrls.push(resolved);
      else return res.status(404).json({ message: 'Image attachment not found.' });
    }

    if (Array.isArray(attachmentIds)) {
      for (const id of attachmentIds) {
        const resolved = await resolveAttachment(id);
        if (resolved) finalReferenceUrls.push(resolved);
      }
    }

    if (videoAttachmentId) {
      const resolved = await resolveAttachment(videoAttachmentId);
      if (!resolved) return res.status(404).json({ message: 'Video attachment not found.' });
      videoUrl = resolved;
    }

    let providerConfig = null;

    if (providerId) {
      const provider = await AIProvider.findById(providerId);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found.' });
      }
      providerConfig = provider[serviceType];
    } else {
      providerConfig = req.body.config;
    }

    if (!providerConfig) {
      return res.status(400).json({ message: 'Provider configuration is missing.' });
    }

    const finalApiKey = apiKey || providerConfig.api_key;
    if (!finalApiKey) {
      return res.status(400).json({ message: 'API Key is required.' });
    }

    const { base_url, create_job_request, auth_type } = providerConfig;
    if (!base_url || !create_job_request || !create_job_request.endpoint || !create_job_request.payload) {
      return res.status(400).json({ message: 'Incomplete provider configuration for job creation.' });
    }

    const finalResolution = resolution || "720p";
    const finalAspectRatio = aspectRatio || "9:16";
    const finalDuration = duration ? duration.toString().replace('s', '') : "5";
    const finalSound = sound === undefined ? false : sound;
    const finalMode = mode || "pro";
    const finalMultiShots = multiShots === undefined ? false : multiShots;
    const finalMultiPrompt = multiPrompt || [];
    const finalKlingElements = klingElements || [];

    let payloadStr = create_job_request.payload;
    if (prompt) payloadStr = payloadStr.replace(/\{\{\s*prompt\s*\}\}/g, prompt);
    if (prompt) payloadStr = payloadStr.replace(/\{\{\s*text\s*\}\}/g, prompt);

    payloadStr = payloadStr.replace(/\{\{\s*aspect_ratio\s*\}\}/g, finalAspectRatio);
    payloadStr = payloadStr.replace(/\{\{\s*resolution\s*\}\}/g, finalResolution);
    payloadStr = payloadStr.replace(/\{\{\s*duration\s*\}\}/g, finalDuration);
    payloadStr = payloadStr.replace(/\{\{\s*sound\s*\}\}/g, finalSound);
    payloadStr = payloadStr.replace(/\{\{\s*mode\s*\}\}/g, finalMode);
    payloadStr = payloadStr.replace(/\{\{\s*multi_shots\s*\}\}/g, finalMultiShots);

    payloadStr = payloadStr.replace(/\"\{\{\s*multi_prompt\s*\}\}\"|\{\{\s*multi_prompt\s*\}\}/g, JSON.stringify(finalMultiPrompt));
    payloadStr = payloadStr.replace(/\"\{\{\s*kling_elements\s*\}\}\"|\{\{\s*kling_elements\s*\}\}/g, JSON.stringify(finalKlingElements));

    if (finalReferenceUrls.length > 0) {
      payloadStr = payloadStr.replace(/\"\{\{\s*reference_urls\s*\}\}\"|\{\{\s*reference_urls\s*\}\}/g, JSON.stringify(finalReferenceUrls));

      payloadStr = payloadStr.replace(/\{\{\s*reference_url\s*\}\}/g, finalReferenceUrls[0]);
      payloadStr = payloadStr.replace(/\{\{\s*image_url\s*\}\}/g, finalReferenceUrls[0]);
      payloadStr = payloadStr.replace(/\{\{\s*input_url\s*\}\}/g, finalReferenceUrls[0]);
      payloadStr = payloadStr.replace(/\{\{\s*image_url_1\s*\}\}/g, finalReferenceUrls[0]);
      if (finalReferenceUrls.length > 1) {
        payloadStr = payloadStr.replace(/\{\{\s*image_url_2\s*\}\}/g, finalReferenceUrls[1]);
      }
    }

    if (videoUrl) payloadStr = payloadStr.replace(/\{\{\s*video_url\s*\}\}/g, videoUrl);

    let payloadObj;
    try {
      payloadObj = JSON.parse(payloadStr);

      if (payloadObj && payloadObj.input) {
        if (finalMultiShots === true || finalMultiShots === 'true') {
          if (finalMultiPrompt && finalMultiPrompt.length > 0) {
            delete payloadObj.input.prompt;
          }
        } else {
          delete payloadObj.input.multi_prompt;
        }

        if (finalKlingElements.length === 0) {
          delete payloadObj.input.kling_elements;
        }
      }
    } catch (e) {
      payloadObj = payloadStr;
    }

    const headers = {};
    if (auth_type && auth_type.includes('Bearer')) {
      headers['Authorization'] = `Bearer ${finalApiKey}`;
    } else if (auth_type === 'Header Key') {
      headers['x-api-key'] = finalApiKey;
    } else {
      headers['Authorization'] = finalApiKey;
    }

    const apiUrl = `${base_url.replace(/\/$/, '')}/${create_job_request.endpoint.replace(/^\//, '')}`;

    const axiosConfig = {
      method: create_job_request.method || 'POST',
      url: apiUrl,
      headers,
      data: payloadObj
    };

    const response = await axios(axiosConfig);

    const { poll_job_status } = providerConfig;
    if (poll_job_status && poll_job_status.endpoint) {
      const taskId = getNestedValue(response.data, create_job_request.job_id_path);
      if (!taskId) {
        return res.status(500).json({
          message: 'Job created but could not extract taskId.',
          data: response.data
        });
      }

      const pollUrl = `${base_url.replace(/\/$/, '')}/${poll_job_status.endpoint.replace(/^\//, '').replace('{{taskId}}', taskId)}`;

      const newTask = new AITask({
        user_id: req.user?._id || null,
        provider_id: providerId || null,
        service_type: serviceType,
        task_id: taskId,
        status: 'pending',
        payload: payloadObj,
        provider_config: providerConfig
      });
      await newTask.save();

      res.status(200).json({
        message: 'Provider test request successful. Job started in background.',
        taskId
      });

      (async () => {
        let finalMediaUrl = null;
        let maxRetries = 120;
        let attempt = 0;

        console.log(`[BACKGROUND] Started polling for taskId: ${taskId}`);

        while (attempt < maxRetries) {
          await delay(10000);
          attempt++;

          const pollConfig = {
            method: poll_job_status.method || 'GET',
            url: pollUrl,
            headers
          };

          try {
            const pollResponse = await axios(pollConfig);
            const currentState = getNestedValue(pollResponse.data, poll_job_status.state_path);

            if (currentState == poll_job_status.success_state_value) {
              finalMediaUrl = getNestedValue(pollResponse.data, poll_job_status.result_media_url_path);
              break;
            } else if (currentState == poll_job_status.failed_state_value) {
              console.error(`[BACKGROUND] Task ${taskId} failed on provider side.`);
              await AITask.findOneAndUpdate({ task_id: taskId }, { status: 'failed', error_message: 'Provider reported failure' });
              return;
            }
          } catch (err) {
            console.error(`[BACKGROUND] Error polling task ${taskId}:`, err.message);
          }
        }

        if (finalMediaUrl) {
          await downloadAndProcessMedia(taskId, finalMediaUrl, req.user?._id, req, true);
        } else {
          console.error(`[BACKGROUND] Polling timed out for task ${taskId}.`);
          await AITask.findOneAndUpdate({ task_id: taskId }, { status: 'failed', error_message: 'Polling timed out' });
          const io = req.app.get('io');
          if (io) io.emit(`ai-task-test-${taskId}`, { taskId, status: 'failed', message: 'Polling timed out' });
        }
      })();

      return;
    }

    const immediateMediaUrl = getNestedValue(response.data, poll_job_status?.result_media_url_path || 'data.url');
    if (immediateMediaUrl) {
      const taskId = getNestedValue(response.data, create_job_request.job_id_path) || 'immediate-' + Date.now();
      (async () => {
        await downloadAndProcessMedia(taskId, immediateMediaUrl, req.user?._id, req, true);
      })();
    }

    if (!res.headersSent) {
      res.status(200).json({
        message: 'Provider test request successful.',
        data: response.data
      });
    }
  } catch (error) {
    console.error('Test AI Provider error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Provider test request failed.', });
    }
  }
};
