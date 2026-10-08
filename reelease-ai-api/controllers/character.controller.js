const { db } = require('../models');
const Character = db.Character;
const AIProvider = db.AIProvider;
const AIFeatureCredit = db.AIFeatureCredit;
const AITask = db.AITask;
const User = db.User;
const Setting = db.Setting;
const Attachment = db.Attachment;
const Role = db.Role;
const axios = require('axios');
const { downloadAndProcessMedia } = require('../utils/watermark-helper');

const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId).populate('roleId');
    return user?.roleId?.name === 'super_admin' || user?.roleId?.name === 'admin';
  } catch (error) {
    return false;
  }
};

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

exports.generateCharacter = async (req, res) => {
  try {
    const {
      name,
      description,
      prompt,
      negative_prompt,
      style = 'realistic',
      resolution = '1024x1024',
      tags = [],
      reference_image_url,
      reference_attachment_id
    } = req.body;

    if (!name || !prompt) {
      return res.status(400).json({ message: 'Character name and prompt are required.' });
    }

    const user = await User.findById(req.user._id).populate('plan_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userIsAdmin = await isAdmin(user._id);

    if (!userIsAdmin && !req.user.hasRolePermission) {
      if (!user.plan_id) {
        return res.status(403).json({ message: 'You need an active plan or specific role to use character generation.' });
      }
      const featureEnabled = user.plan_id.ai_features?.character_generation;
      if (featureEnabled === false) {
        return res.status(403).json({ message: 'Your current plan and role do not support character generation.' });
      }
    }

    const setting = await Setting.findOne();
    let providerId = setting?.active_ai_provider_id;

    if (!providerId) {
      const firstProvider = await AIProvider.findOne();
      if (!firstProvider) {
        return res.status(400).json({ message: 'No AI providers configured.' });
      }
      providerId = firstProvider._id;
    }

    const provider = await AIProvider.findById(providerId);
    if (!provider || !provider.text_to_image || !provider.text_to_image.enabled) {
      return res.status(400).json({
        message: 'Text-to-image service is not enabled for the active provider.'
      });
    }

    const providerConfig = provider.text_to_image;

    const featureCredit = await AIFeatureCredit.findOne({
      provider_id: providerId,
      feature_key: 'text_to_image'
    });
    const creditCost = featureCredit ? featureCredit.credits : 0;

    const remainingCredits = user.total_credits - user.used_credits;
    if (!userIsAdmin && remainingCredits < creditCost) {
      return res.status(400).json({
        message: `Insufficient credits. Required: ${creditCost}, Available: ${remainingCredits}`
      });
    }

    let finalReferenceUrl = reference_image_url;
    if (reference_attachment_id) {
      const attachment = await Attachment.findById(reference_attachment_id);
      if (attachment) {
        const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        finalReferenceUrl = attachment.file_path.startsWith('http')
          ? attachment.file_path
          : `${cleanBaseUrl}${attachment.file_path.startsWith('/') ? '' : '/'}${attachment.file_path}`;
      }
    }

    const topUpDeduction = Math.min(creditCost, user.top_up_credits || 0);
    user.top_up_credits = (user.top_up_credits || 0) - topUpDeduction;
    user.used_credits += creditCost;
    await user.save();

    let enhancedPrompt = prompt;
    if (style === 'realistic') {
      enhancedPrompt += ', photorealistic, highly detailed, professional photography';
    } else if (style === 'anime') {
      enhancedPrompt += ', anime style, manga, vibrant colors, detailed illustration';
    } else if (style === 'cartoon') {
      enhancedPrompt += ', cartoon style, colorful, fun, playful design';
    } else if (style === '3d') {
      enhancedPrompt += ', 3D render, Pixar style, cinematic lighting, high quality';
    } else if (style === 'illustration') {
      enhancedPrompt += ', digital illustration, artistic, detailed, creative';
    } else if (style === 'pixel-art') {
      enhancedPrompt += ', pixel art style, retro game aesthetic, 8-bit';
    }

    if (negative_prompt) {
      enhancedPrompt += `, ${negative_prompt}`;
    }

    let payloadStr = providerConfig.create_job_request.payload;
    payloadStr = payloadStr.replace(/\{\{\s*prompt\s*\}\}/g, enhancedPrompt);
    payloadStr = payloadStr.replace(/\{\{\s*aspect_ratio\s*\}\}/g, resolution === '1024x1024' ? '1:1' : resolution === '512x768' ? '2:3' : resolution === '768x512' ? '3:2' : '16:9');
    payloadStr = payloadStr.replace(/\{\{\s*resolution\s*\}\}/g, '1K');

    if (finalReferenceUrl) {
      payloadStr = payloadStr.replace(/\{\{\s*reference_url\s*\}\}/g, finalReferenceUrl);
      payloadStr = payloadStr.replace(/\{\{\s*image_url\s*\}\}/g, finalReferenceUrl);
    } else {
      payloadStr = payloadStr.replace(/\{\{\s*reference_url\s*\}\}/g, '');
      payloadStr = payloadStr.replace(/\{\{\s*image_url\s*\}\}/g, '');
    }

    let payloadObj;
    try {
      payloadObj = JSON.parse(payloadStr);
    } catch (e) {
      payloadObj = payloadStr;
    }

    const headers = { 'Content-Type': 'application/json' };
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
      user.used_credits -= creditCost;
      user.top_up_credits += topUpDeduction;
      await user.save();

      return res.status(400).json({
        message: 'Failed to create generation job. Credits refunded.'
      });
    }

    const newTask = new AITask({
      user_id: user._id,
      provider_id: providerId,
      service_type: 'character_generation',
      task_id: taskId,
      status: 'running',
      credits_used: creditCost,
      payload: payloadObj,
      provider_config: providerConfig
    });
    await newTask.save();

    res.status(200).json({
      success: true,
      message: 'Character generation started successfully.',
      taskId,
      credits_remaining: user.total_credits - user.used_credits
    });

    if (providerConfig.poll_job_status?.endpoint) {
      (async () => {
        const io = req.app.get('io');

        let finalMediaUrl = null;
        let maxRetries = 120;
        let attempt = 0;

        while (attempt < maxRetries) {
          attempt++;

          try {
            const pollUrl = `${providerConfig.base_url.replace(/\/$/, '')}/${providerConfig.poll_job_status.endpoint.replace(/^\//, '').replace('{{taskId}}', taskId)}`;
            const pollResponse = await axios({
              method: providerConfig.poll_job_status.method || 'GET',
              url: pollUrl,
              headers
            });

            const currentState = getNestedValue(pollResponse.data, providerConfig.poll_job_status.state_path);

            if (currentState == providerConfig.poll_job_status.success_state_value) {
              finalMediaUrl = getNestedValue(pollResponse.data, providerConfig.poll_job_status.result_media_url_path);
              break;
            } else if (currentState == providerConfig.poll_job_status.failed_state_value) {
              await AITask.findOneAndUpdate(
                { task_id: taskId },
                { status: 'failed', error_message: 'Provider reported failure' }
              );

              await User.findByIdAndUpdate(user._id, {
                $inc: {
                  used_credits: -creditCost,
                  top_up_credits: topUpDeduction
                }
              });

              const errorPayload = {
                taskId,
                status: 'failed',
                message: 'Character generation failed',
                type: 'character'
              };
              if (io) io.emit(`ai-task-${user._id}`, errorPayload);
              return;
            }
          } catch (err) {
            console.error(`Character poll error ${taskId}:`, err.message);
          }
        }
        if (finalMediaUrl) {
          await downloadAndProcessMedia(taskId, finalMediaUrl, user._id, req);

          const completedTask = await AITask.findOne({ task_id: taskId });

          if (!completedTask || !completedTask.result_url) {
            throw new Error('Task completed but no result URL found');
          }

          const imagePath = completedTask.result_url.replace(/\\/g, '/');

          const character = new Character({
            name,
            description: description || '',
            prompt,
            negative_prompt: negative_prompt || '',
            image_url: imagePath,
            style,
            resolution,
            provider: provider.name,
            model_used: providerConfig.model || 'text-to-image',
            credits_used: creditCost,
            user_id: user._id,
            tags: Array.isArray(tags) ? tags : [],
            status: 'active'
          });

          await character.save();

          await AITask.findOneAndUpdate(
            { task_id: taskId },
            {
              status: 'completed',
              result_url: imagePath
            }
          );

          const successPayload = {
            taskId,
            status: 'completed',
            message: 'Character generated successfully',
            type: 'character',
            character: character.toJSON(),
            resultUrl: imagePath
          };
          if (io) io.emit(`ai-task-${user._id}`, successPayload);
        } else {
          await AITask.findOneAndUpdate(
            { task_id: taskId },
            { status: 'failed', error_message: 'Polling timed out' }
          );

          await User.findByIdAndUpdate(user._id, {
            $inc: {
              used_credits: -creditCost,
              top_up_credits: topUpDeduction
            }
          });

          const timeoutPayload = {
            taskId,
            status: 'failed',
            message: 'Character generation timed out',
            type: 'character'
          };
          if (io) io.emit(`ai-task-${user._id}`, timeoutPayload);
        }
      })();
    }

  } catch (error) {
    console.error('Generate character error:', error);

    try {
      const user = await User.findById(req.user._id);
      if (user && error.message.includes('credit')) {
        user.used_credits -= creditCost || 0;
        await user.save();
      }
    } catch (refundError) {
      console.error('Credit refund error:', refundError);
    }

    res.status(500).json({
      message: error.message || 'Failed to generate character.'
    });
  }
};

exports.getCharacters = async (req, res) => {
  try {
    const {
      search,
      style,
      status = 'active',
      tag,
      page = 1,
      limit = 20
    } = req.query;

    const query = { user_id: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { prompt: { $regex: search, $options: 'i' } }
      ];
    }

    if (style) {
      query.style = style;
    }

    if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const characters = await Character.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Character.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        characters,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({
      message: 'Failed to fetch characters.'
    });
  }
};

exports.getCharacter = async (req, res) => {
  try {
    const { id } = req.params;

    const character = await Character.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    character.usage_count += 1;
    await character.save();

    res.status(200).json({
      success: true,
      data: character
    });

  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ message: 'Failed to fetch character.' });
  }
};

exports.deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;

    const character = await Character.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    await Character.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Character deleted successfully.'
    });

  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ message: 'Failed to delete character.' });
  }
};

exports.updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tags, status } = req.body;

    const character = await Character.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    if (name) character.name = name;
    if (description !== undefined) character.description = description;
    if (tags) character.tags = Array.isArray(tags) ? tags : [];
    if (status) character.status = status;

    await character.save();

    res.status(200).json({
      success: true,
      message: 'Character updated successfully.',
      data: character
    });

  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ message: 'Failed to update character.' });
  }
};
