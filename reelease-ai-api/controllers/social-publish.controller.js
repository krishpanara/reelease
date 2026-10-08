const { db } = require('../models');
const mongoose = require('mongoose');
const SocialAccount = db.SocialAccount;
const SocialPost = db.SocialPost;
const SocialDraft = db.SocialDraft;
const Attachment = db.Attachment;
const AICaptionModel = db.AICaptionModel;
const User = db.User;
const Role = db.Role;
const socialMediaService = require('../services/socialMediaService');
const mediaProcessor = require('../utils/mediaProcessor');
const fileHelper = require('../utils/fileHelper');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { getAIErrorMessage } = require("../helpers/errorHelper");

const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId).populate('roleId');
    return user?.roleId?.name === 'super_admin' || user?.roleId?.name === 'admin';
  } catch (error) {
    return false;
  }
};

const PLATFORM_CONTENT_TYPES = {
  facebook: ['post', 'story', 'reel', 'feed', 'video'],
  instagram: ['post', 'story', 'reel'],
  linkedin: ['post', 'article'],
  twitter: ['post', 'story', 'reel'],
  youtube: ['videos', 'shorts'],
  threads: ['post']
};

const ALL_CONTENT_TYPES = [...new Set(Object.values(PLATFORM_CONTENT_TYPES).flat())];

const downloadAudioIfNeeded = async (audioUrl) => {
  if (!audioUrl) return { source: '', tempPath: null };
  if (audioUrl.startsWith('http')) {
    try {
      const tempMusicName = `temp_music_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp3`;
      const tempMusicPath = path.join(__dirname, '..', 'uploads', 'social-post', tempMusicName);
      const socialPostDir = path.dirname(tempMusicPath);
      if (!fs.existsSync(socialPostDir)) fs.mkdirSync(socialPostDir, { recursive: true });

      const response = await axios({ method: 'get', url: audioUrl, responseType: 'stream' });

      const contentType = (response.headers['content-type'] || '').toLowerCase();
      if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
        throw new Error(
          `The audio URL returned an HTML page instead of an audio file. ` +
          `Please provide a direct link to an audio file (e.g. ending in .mp3, .wav, .m4a). ` +
          `Received content-type: "${contentType}"`
        );
      }

      const writer = fs.createWriteStream(tempMusicPath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      return { source: tempMusicPath, tempPath: tempMusicPath };
    } catch (dlErr) {
      throw new Error(`Failed to download audio from URL: ${dlErr.message}`);
    }
  } else {
    const cleanAudioPath = audioUrl.replace(/^\/api\//, '').replace(/^\//, '');
    return { source: path.join(__dirname, '..', cleanAudioPath), tempPath: null };
  }
};

const cleanupTemp = (tempPath) => {
  if (tempPath && fs.existsSync(tempPath)) {
    try { fs.unlinkSync(tempPath); } catch (e) { console.error('Failed to clean up temp audio file:', e.message); }
  }
};

exports.publishContent = async (req, res) => {
  try {
    const {
      accountIds,
      attachmentIds,
      mediaUrl,
      mediaUrls,
      caption,
      contentTypes,
      scheduled_at,
      storyText,
      storyTextColor,
      storyTextBg,
      storyTextSize,
      storyTextPosition,
      storyBgColor,
      audioUrl,
      audioName
    } = req.body;
    const userId = req.user.id;

    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
      return res.status(400).json({ message: 'accountIds must be a non-empty array' });
    }

    if (!contentTypes || !Array.isArray(contentTypes) || contentTypes.length === 0) {
      return res.status(400).json({ message: 'contentTypes must be a non-empty array (post, story, reel, etc.)' });
    }

    for (const type of contentTypes) {
      if (!ALL_CONTENT_TYPES.includes(type)) {
        return res.status(400).json({ message: `Invalid content type: ${type}. Allowed: ${ALL_CONTENT_TYPES.join(', ')}` });
      }
    }

    let scheduledDate = null;
    let isScheduled = false;
    if (scheduled_at) {
      scheduledDate = new Date(scheduled_at);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: 'Invalid scheduled_at date format' });
      }
      if (scheduledDate <= new Date(Date.now() - 60000)) {
        return res.status(400).json({ message: 'scheduled_at must be a future date/time' });
      }
      isScheduled = true;
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

    const accounts = await SocialAccount.find({
      _id: { $in: accountIds },
      user: userId,
      is_active: true
    });

    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No valid social accounts found' });
    }

    for (const type of contentTypes) {
      for (const account of accounts) {
        if (account.platform === 'threads') {
          continue;
        }
        const allowed = PLATFORM_CONTENT_TYPES[account.platform] || [];
        if (!allowed.includes(type)) {
          return res.status(400).json({
            message: `${account.platform} account (${account.account_name}) does not support content type: ${type}. Allowed: ${allowed.join(', ')}`
          });
        }
      }
    }

    const postHistoryRecords = [];
    const mediaCache = {};
    const createdThreadsAccounts = new Set();

    for (const type of contentTypes) {
      let finalMediaPaths = [];

      if (attachmentIds && Array.isArray(attachmentIds) && attachmentIds.length > 0) {
        const validIds = attachmentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length > 0) {
          const attachments = await Attachment.find({ _id: { $in: validIds } });

          for (const att of attachments) {
            let filePath = att.file_path;
            const textOptionsHash = (type === 'story' && storyText)
              ? Buffer.from(`${storyText}_${storyTextColor}_${storyTextBg}_${storyTextSize}_${storyTextPosition}`).toString('base64')
              : 'none';
            const cacheKey = `${filePath}_${type}_${textOptionsHash}`;

            if (mediaCache[cacheKey]) {
              filePath = mediaCache[cacheKey];
            } else {
              const absoluteInputPath = path.join(__dirname, '..', filePath);
              const ext = path.extname(filePath);
              const processedFileName = path.basename(filePath, ext) + `_processed_${type}_${Date.now()}` + (mediaProcessor.isShortVideo(filePath) || audioUrl || type === 'reel' || type === 'shorts' ? '.mp4' : (type === 'story' ? '.jpg' : ext));
              const processedFilePath = path.join('uploads', 'social-post', processedFileName);
              const absoluteOutputPath = path.join(__dirname, '..', processedFilePath);

              const socialPostDir = path.join(__dirname, '..', 'uploads', 'social-post');
              if (!fs.existsSync(socialPostDir)) fs.mkdirSync(socialPostDir, { recursive: true });

              if (type === 'story' || type === 'reel' || type === 'shorts') {
                const { source: finalAudioSource, tempPath: tempAudioPath } = await downloadAudioIfNeeded(audioUrl);
                try {
                  await mediaProcessor.processMedia(absoluteInputPath, absoluteOutputPath, {
                    type,
                    storyText,
                    storyTextColor,
                    storyTextBg,
                    storyTextSize,
                    storyTextPosition,
                    storyBgColor,
                    audioUrl: finalAudioSource
                  });
                  filePath = processedFilePath;
                } finally {
                  cleanupTemp(tempAudioPath);
                }
                filePath = processedFilePath;
              } else if (type === 'story' && mediaProcessor.isImage(filePath) && storyText) {
                const absoluteInputPath = path.join(__dirname, '..', filePath);
                const ext = path.extname(filePath);
                const processedFileName = path.basename(filePath, ext) + '_story_text_' + Date.now() + ext;
                const processedFilePath = path.join('uploads', 'social-post', processedFileName);
                const absoluteOutputPath = path.join(__dirname, '..', processedFilePath);

                const socialPostDir = path.join(__dirname, '..', 'uploads', 'social-post');
                if (!fs.existsSync(socialPostDir)) fs.mkdirSync(socialPostDir, { recursive: true });

                try {
                  await mediaProcessor.addStoryTextToImage(absoluteInputPath, absoluteOutputPath, {
                    storyText, storyTextColor, storyTextBg, storyTextSize, storyTextPosition
                  });
                  filePath = processedFilePath;
                } catch (e) {
                  console.error("Failed to add text to image", e);
                }
              }

              mediaCache[cacheKey] = filePath;
            }

            const relativePath = await fileHelper.ensureSocialPostMedia(filePath);
            finalMediaPaths.push(relativePath);
          }
        }
      }

      if (mediaUrls && Array.isArray(mediaUrls)) {
        for (const url of mediaUrls) {
          let relativePath = fileHelper.getRelativePath(url, baseUrl);

          if (type === 'story' || type === 'reel' || type === 'shorts') {
            const cacheKey = `${relativePath}_${type}`;
            if (mediaCache[cacheKey]) {
              relativePath = mediaCache[cacheKey];
            } else {
              const absoluteInputPath = path.join(__dirname, '..', relativePath);
              const ext = path.extname(relativePath) || '.png';
              const processedFileName = path.basename(relativePath, ext) + `_processed_${type}_${Date.now()}` + (mediaProcessor.isShortVideo(relativePath) || audioUrl || type === 'reel' || type === 'shorts' ? '.mp4' : (type === 'story' ? '.jpg' : ext));
              const processedFilePath = path.join('uploads', 'social-post', processedFileName);
              const absoluteOutputPath = path.join(__dirname, '..', processedFilePath);

              const socialPostDir = path.join(__dirname, '..', 'uploads', 'social-post');
              if (!fs.existsSync(socialPostDir)) fs.mkdirSync(socialPostDir, { recursive: true });

              const { source: finalAudioSource, tempPath: tempAudioPath } = await downloadAudioIfNeeded(audioUrl);
              try {
                await mediaProcessor.processMedia(absoluteInputPath, absoluteOutputPath, {
                  type,
                  storyText,
                  storyTextColor,
                  storyTextBg,
                  storyTextSize,
                  storyTextPosition,
                  storyBgColor,
                  audioUrl: finalAudioSource
                });
              } finally {
                cleanupTemp(tempAudioPath);
              }

              relativePath = await fileHelper.ensureSocialPostMedia(processedFilePath);
              mediaCache[cacheKey] = relativePath;
            }
          }

          if (!finalMediaPaths.includes(relativePath)) {
            finalMediaPaths.push(relativePath);
          }
        }
      } else if (mediaUrl) {
        let relativePath = fileHelper.getRelativePath(mediaUrl, baseUrl);

        if (type === 'story' || type === 'reel' || type === 'shorts') {
          const cacheKey = `${relativePath}_${type}`;
          if (mediaCache[cacheKey]) {
            relativePath = mediaCache[cacheKey];
          } else {
            const absoluteInputPath = path.join(__dirname, '..', relativePath);
            const ext = path.extname(relativePath) || '.png';
            const processedFileName = path.basename(relativePath, ext) + `_processed_${type}_${Date.now()}` + (mediaProcessor.isShortVideo(relativePath) || audioUrl || type === 'reel' || type === 'shorts' ? '.mp4' : (type === 'story' ? '.jpg' : ext));
            const processedFilePath = path.join('uploads', 'social-post', processedFileName);
            const absoluteOutputPath = path.join(__dirname, '..', processedFilePath);

            const socialPostDir = path.join(__dirname, '..', 'uploads', 'social-post');
            if (!fs.existsSync(socialPostDir)) fs.mkdirSync(socialPostDir, { recursive: true });

            const { source: finalAudioSource, tempPath: tempAudioPath } = await downloadAudioIfNeeded(audioUrl);
            try {
              await mediaProcessor.processMedia(absoluteInputPath, absoluteOutputPath, {
                type,
                storyText,
                storyTextColor,
                storyTextBg,
                storyTextSize,
                storyTextPosition,
                storyBgColor,
                audioUrl: finalAudioSource
              });
            } finally {
              cleanupTemp(tempAudioPath);
            }

            relativePath = await fileHelper.ensureSocialPostMedia(processedFilePath);
            mediaCache[cacheKey] = relativePath;
          }
        }

        if (!finalMediaPaths.includes(relativePath)) {
          finalMediaPaths.push(relativePath);
        }
      }

      if (finalMediaPaths.length === 0 && type === 'story' && storyText) {
        const processedFileName = `story_generated_${Date.now()}` + (audioUrl ? '.mp4' : '.jpg');
        const processedFilePath = path.join('uploads', 'social-post', processedFileName);
        const absoluteOutputPath = path.join(__dirname, '..', processedFilePath);

        const socialPostDir = path.join(__dirname, '..', 'uploads', 'social-post');
        if (!fs.existsSync(socialPostDir)) fs.mkdirSync(socialPostDir, { recursive: true });

        const { source: finalAudioSource, tempPath: tempAudioPath } = await downloadAudioIfNeeded(audioUrl);
        try {
          await mediaProcessor.processMedia(null, absoluteOutputPath, {
            type,
            storyText,
            storyTextColor,
            storyTextBg,
            storyTextSize,
            storyTextPosition,
            storyBgColor,
            audioUrl: finalAudioSource
          });
        } finally {
          cleanupTemp(tempAudioPath);
        }

        const relativePath = await fileHelper.ensureSocialPostMedia(processedFilePath);
        finalMediaPaths.push(relativePath);
      }

      if (finalMediaPaths.length === 0 && !caption) {
        return res.status(400).json({ message: 'Either attachmentIds, mediaUrls, mediaUrl or caption is required' });
      }

      for (const account of accounts) {
        if (account.platform === 'threads') {
          const accountIdStr = account._id.toString();
          if (createdThreadsAccounts.has(accountIdStr)) {
            continue;
          }
          createdThreadsAccounts.add(accountIdStr);
        }

        const socialPost = new SocialPost({
          user: userId,
          account: account._id,
          platform: account.platform,
          post_id: 'PENDING',
          content_type: account.platform === 'threads' ? 'post' : type,
          caption: caption || '',
          media_urls: finalMediaPaths,
          status: isScheduled ? 'scheduled' : 'pending',
          scheduled_at: scheduledDate,
          published_at: isScheduled ? null : new Date(),
          metadata: {
            storyText,
            storyTextColor,
            storyTextBg,
            storyTextSize,
            storyTextPosition,
            storyBgColor,
            audioUrl,
            audioName
          }
        });

        await socialPost.save();
        postHistoryRecords.push(socialPost);
      }
    }

    if (isScheduled) {
      return res.status(202).json({
        success: true,
        message: `Post(s) scheduled for ${scheduledDate.toISOString()}`,
        data: postHistoryRecords
      });
    }

    res.status(202).json({ success: true, message: 'Publishing has started successfully.', data: postHistoryRecords });

    const io = req.app.get('io');
    (async () => {
      for (const socialPost of postHistoryRecords) {
        try {
          await socialMediaService.publishContent(
            SocialAccount, socialPost._id, userId,
            socialPost.media_urls, caption, socialPost.content_type,
            socialPost.platform, baseUrl, io
          );
        } catch (error) {
          console.error(`Background publishing failed for post ${socialPost._id}:`, error);
        }
      }
    })();

  } catch (error) {
    console.error('Error publishing content:', error);
    res.status(500).json({ message: error.message || 'Failed to publish content' });
  }
};

exports.cancelScheduledPost = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user.id;

    const post = await SocialPost.findOne({ _id: historyId, user: userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot cancel a post with status: ${post.status}` });
    }

    post.status = 'cancelled';
    await post.save();

    res.status(200).json({ success: true, message: 'Scheduled post cancelled successfully', data: post });
  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel scheduled post' });
  }
};

exports.generateCaption = async (req, res) => {
  try {
    const { platform, content_type, tone, language, character_limit, image_url, purpose, keywords, additional_context, custom_prompt, num_captions } = req.body;
    const isImagePrompt = purpose === 'image_prompt';

    if (!platform && !isImagePrompt) {
      return res.status(400).json({ message: 'platform is required' });
    }

    const resolvedPlatform = platform || 'instagram';

    if (!isImagePrompt && !PLATFORM_CONTENT_TYPES[resolvedPlatform]) {
      return res.status(400).json({ message: `Unsupported platform: ${resolvedPlatform}` });
    }

    const defaultPlatformLimits = {
      instagram: 2200,
      facebook: 2000,
      linkedin: 3000,
      twitter: 280,
      youtube: 5000,
    };

    const charLimit = character_limit || defaultPlatformLimits[resolvedPlatform] || 2000;
    const postTone = tone || 'engaging and professional';
    const postType = content_type || 'post';
    const lang = language || 'English';

    const defaultModel = await AICaptionModel.findOne({ is_default: true, is_active: true });
    if (!defaultModel) {
      return res.status(503).json({
        message: 'No default AI model configured for caption generation. Please contact admin.',
      });
    }

    const numCaptions = isImagePrompt ? 1 : Math.min(parseInt(num_captions || 3), 5);

    let prompt = '';
    if (isImagePrompt) {
      prompt = `Generate a creative and detailed image generation prompt based on this context:`;
      if (custom_prompt) prompt += `\nTopic/Instructions: ${custom_prompt}`;
      if (keywords) prompt += `\nKeywords: ${keywords}`;
      prompt += `\nReturn ONLY a single text string of the prompt, no explanation or markdown formatting.`;
    } else {
      prompt = `Generate ${numCaptions} different social media captions for ${resolvedPlatform.charAt(0).toUpperCase() + resolvedPlatform.slice(1)}.`;
      prompt += `\nContent type: ${postType}`;
      prompt += `\nTone: ${postTone}`;
      prompt += `\nLanguage: ${lang}`;
      prompt += `\nCharacter limit: ${charLimit} characters per caption`;
      if (keywords) prompt += `\nKeywords/topics to include: ${keywords}`;
      if (custom_prompt) prompt += `\nUser's custom instructions: ${custom_prompt}`;
      if (additional_context) prompt += `\nAdditional context: ${additional_context}`;

      prompt += `\n\nIMPORTANT: Provide exactly ${numCaptions} different caption options.`;
      prompt += `\nFormat your response as a JSON array like this:`;
      prompt += `\n["caption 1 text", "caption 2 text", "caption 3 text"]`;
      prompt += `\nEach caption should:`;
      prompt += `\n- Be unique and different from the others`;
      prompt += `\n- Include relevant hashtags for ${resolvedPlatform}`;
      prompt += `\n- Be within ${charLimit} characters`;
      prompt += `\n- Match the tone: ${postTone}`;
      if (resolvedPlatform === 'twitter') prompt += `\n- Keep it under ${charLimit} characters including hashtags.`;
      prompt += `\n\nReturn ONLY the JSON array, no explanation or other text.`;

      if (image_url) {
        prompt = `Analyze the provided image and generate ${numCaptions} engaging social media captions for ${resolvedPlatform.charAt(0).toUpperCase() + resolvedPlatform.slice(1)} based on what you see in the image.` +
          `\n\nContent type: ${postType}` +
          `\nTone: ${postTone}` +
          `\nLanguage: ${lang}` +
          `\nCharacter limit: ${charLimit} characters per caption` +
          (keywords ? `\nKeywords/topics to include: ${keywords}` : '') +
          (custom_prompt ? `\nUser's custom instructions: ${custom_prompt}` : '') +
          `\n\nIMPORTANT: Provide exactly ${numCaptions} different caption options.` +
          `\nFormat your response as a JSON array like this:` +
          `\n["caption 1 text", "caption 2 text", "caption 3 text"]` +
          `\nEach caption should:` +
          `\n- Be based on what you see in the image` +
          `\n- Be unique and different from the others` +
          `\n- Include relevant hashtags for ${resolvedPlatform}` +
          `\n- Be within ${charLimit} characters` +
          `\n- Match the tone: ${postTone}` +
          (resolvedPlatform === 'twitter' ? `\n- Keep it under ${charLimit} characters including hashtags.` : '') +
          `\n\nReturn ONLY the JSON array, no explanation or other text.`;
      }
    }

    const user = req.user;
    const userIsAdmin = await isAdmin(user._id);
    if (!userIsAdmin && user.caption_credits < defaultModel.credit_cost) {
      return res.status(400).json({
        message: `Insufficient caption credits. Required: ${defaultModel.credit_cost}, Available: ${user.caption_credits}`,
      });
    }

    let captions = [];
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    if (defaultModel.provider === 'gemini') {
      try {
        const genAI = new GoogleGenerativeAI(defaultModel.api_key);
        const model = genAI.getGenerativeModel({ model: defaultModel.model_id });

        let result;
        if (image_url) {
          const imageResponse = await axios.get(image_url, { responseType: 'arraybuffer' });
          const base64Image = Buffer.from(imageResponse.data).toString('base64');
          const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

          result = await model.generateContent([
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]);
        } else {
          result = await model.generateContent(prompt);
        }

        const responseText = result.response.text().trim();

        if (isImagePrompt) {
          captions = [responseText];
        } else {
          try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              captions = JSON.parse(jsonMatch[0]);
            } else {
              captions = [responseText];
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            captions = [responseText];
          }
        }
      } catch (geminiError) {
        console.error('Gemini AI error:', geminiError.message);
        throw new Error(`Gemini AI failed: ${geminiError.message}`);
      }
    } else if (defaultModel.provider === 'openai') {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: defaultModel.api_key });

        let messages;
        if (image_url && !isImagePrompt) {
          messages = [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: image_url
                  }
                }
              ]
            }
          ];
        } else {
          messages = [{ role: 'user', content: prompt }];
        }

        const completion = await openai.chat.completions.create({
          model: defaultModel.model_id,
          messages: messages,
          max_tokens: defaultModel.max_output_tokens || 1500
        });

        const responseText = completion.choices[0].message.content.trim();

        if (isImagePrompt) {
          captions = [responseText];
        } else {
          try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              captions = JSON.parse(jsonMatch[0]);
            } else {
              captions = [responseText];
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            captions = [responseText];
          }
        }
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError.message);
        throw new Error(`OpenAI failed: ${openaiError.message}`);
      }
    } else {
      throw new Error(`Unsupported provider: ${defaultModel.provider}`);
    }

    captions = captions.map(cap => cap.trim()).filter(cap => cap.length > 0);

    user.caption_credits -= defaultModel.credit_cost;
    await user.save();


    res.status(200).json({
      success: true,
      data: {
        captions,
        platform: resolvedPlatform,
        content_type: postType,
        tone: postTone,
        language: lang,
        character_limit: charLimit,
        model_used: defaultModel.name,
        credits_used: defaultModel.credit_cost,
        remaining_credits: user.caption_credits,
        has_image: !!image_url,
      },
    });
  } catch (error) {
    console.error('Error generating caption:', error);
    const message = getAIErrorMessage(error);
    const statusCode =
      message.includes('quota') || message.includes('Rate limit') || (error.message || '').includes('429')
        ? 429
        : 500;
    res.status(statusCode).json({ message });
  }
};

exports.validateMedia = async (req, res) => {
  try {
    const { mediaUrl, platform, contentType, contentTypes } = req.body;

    if (!mediaUrl) return res.status(400).json({ message: 'Media URL is required' });
    if (!platform) return res.status(400).json({ message: 'Platform is required' });

    const typesToValidate = contentTypes && Array.isArray(contentTypes)
      ? contentTypes
      : (contentType ? [contentType] : []);

    const validation = { valid: true, warnings: [], errors: [] };

    if (!/^https?:\/\/.+/i.test(mediaUrl)) {
      validation.valid = false;
      validation.errors.push('Invalid URL format');
    }

    const urlLower = mediaUrl.toLowerCase();
    const isImage = urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/);
    const isVideo = urlLower.match(/\.(mp4|mov|avi|mkv|webm)$/);

    if (!isImage && !isVideo) {
      validation.warnings.push('Could not determine media type from URL');
    }

    for (const type of typesToValidate) {
      if (platform === 'instagram') {
        if (type === 'story') validation.warnings.push('[Story] Instagram stories require 9:16 aspect ratio (1080x1920px)');
        else if (type === 'reel') {
          if (!isVideo) { validation.errors.push('[Reel] Instagram reels must be video files'); validation.valid = false; }
          validation.warnings.push('[Reel] Instagram reels require 9:16 aspect ratio and max 90 seconds');
        } else if (type === 'post') validation.warnings.push('[Post] Instagram posts support: 1:1, 4:5, or 1.91:1 aspect ratios');
      }
      if (platform === 'facebook') {
        if (type === 'story') validation.warnings.push('[Story] Facebook stories require 9:16 aspect ratio');
      }
      if (platform === 'linkedin') {
        if (isVideo) validation.warnings.push('[LinkedIn] Video posts on LinkedIn require MP4 format, max 5GB');
        else validation.warnings.push('[LinkedIn] Images should be JPG or PNG, recommended 1200x627px');
      }
      if (platform === 'youtube') {
        if (!isVideo) {
          validation.errors.push('[YouTube] YouTube only supports video uploads (MP4, MOV)');
          validation.valid = false;
        } else {
          validation.warnings.push('[YouTube] Videos should be MP4 format, max 256GB. Shorts must be under 60 seconds and vertical (9:16).');
        }
      }
      if (platform === 'twitter') {
        if (isVideo) validation.warnings.push('[Twitter] Videos max 512MB, 2min 20sec, MP4 recommended');
        else validation.warnings.push('[Twitter] Images max 5MB, up to 4 images per tweet');
        if (type === 'story') validation.warnings.push('[Twitter Story] Twitter stories post as media tweets; use vertical 9:16 video/image for best results');
        if (type === 'reel') {
          if (!isVideo) { validation.errors.push('[Twitter Reel] Reels should be video files for best results'); }
          validation.warnings.push('[Twitter Reel] Twitter reels post as video tweets; use vertical MP4 for best results');
        }
      }
      if (platform === 'threads') {
        if (isVideo) validation.warnings.push('[Threads] Video files must be max 5 minutes and 1GB');
        else validation.warnings.push('[Threads] Images max 8MB, up to 10 images per carousel');
        if (type === 'story' || type === 'reel') {
          validation.warnings.push('[Threads] Threads does not natively support stories or reels. This will be published as a standard post.');
        }
      }
    }

    validation.warnings.push('Ensure image size < 8MB, video size < 4GB');

    res.status(200).json({ success: true, data: validation });
  } catch (error) {
    console.error('Error validating media:', error);
    res.status(500).json({ message: 'Failed to validate media' });
  }
};

exports.getSupportedPlatforms = async (req, res) => {
  try {
    const platforms = {
      facebook: {
        name: 'Facebook',
        contentTypes: ['post', 'story', 'feed', 'reel', 'video'],
        mediaTypes: ['image', 'video', 'text'],
        maxCaptionLength: 63206,
        supportedFormats: { images: ['jpg', 'jpeg', 'png', 'gif', 'webp'], videos: ['mp4', 'mov', 'avi'] }
      },
      instagram: {
        name: 'Instagram',
        contentTypes: ['post', 'story', 'reel'],
        mediaTypes: ['image', 'video'],
        maxCaptionLength: 2000,
        supportedFormats: { images: ['jpg', 'jpeg', 'png'], videos: ['mp4'] }
      },
      linkedin: {
        name: 'LinkedIn',
        contentTypes: ['post', 'article'],
        mediaTypes: ['image', 'text'],
        maxCaptionLength: 3000,
        supportedFormats: { images: ['jpg', 'jpeg', 'png', 'gif'], videos: ['mp4'] },
        notes: 'Video upload on LinkedIn is available; article type posts text only.'
      },
      twitter: {
        name: 'Twitter / X',
        contentTypes: ['post', 'story', 'reel'],
        mediaTypes: ['image', 'video', 'text'],
        maxCaptionLength: 280,
        supportedFormats: { images: ['jpg', 'jpeg', 'png', 'gif', 'webp'], videos: ['mp4', 'mov'] },
        notes: 'Story and reel content types publish as media tweets. Max 4 images or 1 video per tweet.'
      },
      youtube: {
        name: 'YouTube',
        contentTypes: ['videos', 'shorts'],
        mediaTypes: ['video'],
        maxCaptionLength: 5000,
        supportedFormats: { images: [], videos: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'] },
        notes: 'YouTube supports video uploads only. "videos" publishes a standard video. "shorts" publishes a YouTube Short (must be vertical 9:16 and under 60 seconds).'
      },
      threads: {
        name: 'Threads',
        contentTypes: ['post'],
        mediaTypes: ['image', 'video', 'text'],
        maxCaptionLength: 500,
        supportedFormats: { images: ['jpg', 'jpeg', 'png'], videos: ['mp4', 'mov'] },
        notes: 'Threads supports text, images, and videos.'
      }
    };

    res.status(200).json({ success: true, data: platforms });
  } catch (error) {
    console.error('Error getting supported platforms:', error);
    res.status(500).json({ message: 'Failed to get supported platforms' });
  }
};


exports.getPostHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, status, content_type, search, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (platform) query.platform = { $in: platform.split(',') };
    if (status && status !== 'all') query.status = { $in: status.split(',') };
    if (content_type) query.content_type = { $in: content_type.split(',') };
    if (search) {
      query.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await SocialPost.find(query)
      .populate('account', 'account_name account_username platform profile_picture')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SocialPost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching post history:', error);
    res.status(500).json({ message: 'Failed to fetch post history' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user.id;
    const post = await SocialPost.findOne({ _id: historyId, user: userId })
      .populate('account', 'account_name account_username platform profile_picture');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post by id:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user.id;

    if (!historyId) {
      return res.status(400).json({ message: 'History ID is required' });
    }

    const result = await socialMediaService.deleteSocialPost(
      SocialPost,
      SocialAccount,
      historyId,
      userId
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message || 'Failed to delete post' });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    const { accountIds, attachmentIds, caption, contentTypes, notes, scheduled_at, title, metadata } = req.body;
    const userId = req.user.id;

    const draft = new SocialDraft({
      user: userId,
      accountIds: accountIds || [],
      attachmentIds: attachmentIds || [],
      caption: caption || '',
      contentTypes: contentTypes || ['post'],
      notes: notes || '',
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      title: title || '',
      metadata: metadata || {}
    });

    await draft.save();

    res.status(201).json({ success: true, message: 'Draft saved successfully', data: draft });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: error.message || 'Failed to save draft' });
  }
};

exports.getDrafts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search } = req.query;

    const query = { user: userId };
    if (search) {
      query.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const drafts = await SocialDraft.find(query)
      .populate('accountIds', 'account_name account_username platform profile_picture')
      .populate('attachmentIds', 'name file_path mime_type file_size')
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SocialDraft.countDocuments(query);

    res.status(200).json({
      success: true,
      data: drafts,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch drafts' });
  }
};

exports.getDraftById = async (req, res) => {
  try {
    const { draftId } = req.params;
    const userId = req.user.id;

    const draft = await SocialDraft.findOne({ _id: draftId, user: userId })
      .populate('accountIds', 'account_name account_username platform profile_picture')
      .populate('attachmentIds', 'name file_path mime_type file_size');

    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch draft' });
  }
};

exports.updateDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const userId = req.user.id;
    const { accountIds, attachmentIds, caption, contentTypes, notes, scheduled_at, title, metadata } = req.body;

    const draft = await SocialDraft.findOneAndUpdate(
      { _id: draftId, user: userId },
      {
        accountIds, attachmentIds, caption, contentTypes, notes, title, metadata,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null
      },
      { new: true, runValidators: true }
    ).populate('accountIds', 'account_name account_username platform profile_picture')
      .populate('attachmentIds', 'name file_path mime_type file_size');

    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    res.status(200).json({ success: true, message: 'Draft updated successfully', data: draft });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ message: error.message || 'Failed to update draft' });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const userId = req.user.id;

    const draft = await SocialDraft.findOneAndDelete({ _id: draftId, user: userId });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    res.status(200).json({ success: true, message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ message: error.message || 'Failed to delete draft' });
  }
};

exports.bulkPublish = async (req, res) => {
  try {
    const { posts, settings } = req.body;
    const userId = req.user.id;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ message: 'posts must be a non-empty array' });
    }

    if (posts.length > 100) {
      return res.status(400).json({ message: 'Maximum 100 posts allowed per bulk request' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

    const results = [];
    const errors = [];

    const {
      postingInterval = 10,
      timezone = '(GMT+5:30) Asia/Kolkata',
      skipHolidays = false,
      maxPostsPerDay = 10,
      autoHashtagRules = [],
      stopOnError = true,
      addFirstComment = false
    } = settings || {};

    const intervalMs = postingInterval * 1000;

    const isWeekend = (date) => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };

    const parseTimezone = (timezoneStr) => {
      const match = timezoneStr.match(/\(GMT([+-]\d+):(\d+)\)\s*(.*)/);
      if (match) {
        const offsetHours = parseInt(match[1], 10);
        const offsetMinutes = parseInt(match[2], 10);
        const offsetMs = (offsetHours * 60 + offsetMinutes) * 60 * 1000;
        return { offsetMs, region: match[3] };
      }
      return { offsetMs: 0, region: 'UTC' };
    };

    const { offsetMs: timezoneOffsetMs } = parseTimezone(timezone);

    const applyHashtags = (caption) => {
      if (!autoHashtagRules || autoHashtagRules.length === 0) return caption;
      const hashtags = autoHashtagRules.map(tag => `#${tag}`).join(' ');
      return caption ? `${caption}\n\n${hashtags}` : hashtags;
    };

    const io = req.app.get('io');
    let postsPublishedToday = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < posts.length; i++) {
      const postItem = posts[i];
      const { accountIds, caption, contentTypes, scheduled_at, mediaUrls, mediaUrl, firstComment } = postItem;

      try {
        if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
          errors.push({ index: i, message: 'accountIds is required', item: postItem });
          if (stopOnError) break;
          continue;
        }

        const types = contentTypes && Array.isArray(contentTypes) && contentTypes.length > 0
          ? contentTypes
          : ['post'];

        for (const type of types) {
          if (!ALL_CONTENT_TYPES.includes(type)) {
            throw new Error(`Invalid content type: ${type}`);
          }
        }

        let scheduledDate = null;
        let isScheduled = false;
        if (scheduled_at) {
          scheduledDate = new Date(scheduled_at);
          if (isNaN(scheduledDate.getTime())) {
            throw new Error('Invalid scheduled_at date format');
          }
          if (scheduledDate <= new Date(Date.now() - 60000)) {
            throw new Error('scheduled_at must be a future date/time');
          }
          isScheduled = true;
        }

        const accounts = await SocialAccount.find({
          _id: { $in: accountIds },
          user: userId,
          is_active: true
        });

        if (accounts.length === 0) {
          errors.push({ index: i, message: 'No valid social accounts found', item: postItem });
          if (stopOnError) break;
          continue;
        }

        let finalMediaPaths = [];
        if (mediaUrls && Array.isArray(mediaUrls)) {
          for (const url of mediaUrls) {
            const relativePath = fileHelper.getRelativePath(url, baseUrl);
            finalMediaPaths.push(relativePath);
          }
        } else if (mediaUrl) {
          const relativePath = fileHelper.getRelativePath(mediaUrl, baseUrl);
          finalMediaPaths.push(relativePath);
        }

        if (finalMediaPaths.length === 0 && !caption) {
          errors.push({ index: i, message: 'Either mediaUrls, mediaUrl or caption is required', item: postItem });
          if (stopOnError) break;
          continue;
        }

        const finalCaption = applyHashtags(caption || '');
        const finalFirstComment = (addFirstComment && firstComment) ? firstComment : null;

        const postHistoryRecords = [];

        for (const type of types) {
          for (const account of accounts) {
            const allowed = PLATFORM_CONTENT_TYPES[account.platform] || [];
            if (!allowed.includes(type)) continue;

            const socialPost = new SocialPost({
              user: userId,
              account: account._id,
              platform: account.platform,
              post_id: 'PENDING',
              content_type: type,
              caption: finalCaption,
              media_urls: finalMediaPaths,
              status: isScheduled ? 'scheduled' : 'pending',
              scheduled_at: scheduledDate,
              published_at: isScheduled ? null : new Date(),
              first_comment: finalFirstComment
            });

            await socialPost.save();
            postHistoryRecords.push(socialPost);
          }
        }

        let allPublished = true;
        let failureMessage = '';

        if (!isScheduled) {
          if (skipHolidays && isWeekend(new Date())) {
            for (const socialPost of postHistoryRecords) {
              socialPost.status = 'skipped';
              socialPost.error_message = 'Skipped due to weekend/holiday setting';
              await socialPost.save();
            }
            results.push({ index: i, success: true, posts: postHistoryRecords, skipped: true });
            continue;
          }

          if (postsPublishedToday >= maxPostsPerDay) {
            for (const socialPost of postHistoryRecords) {
              socialPost.status = 'skipped';
              socialPost.error_message = 'Skipped due to maximum posts per day limit';
              await socialPost.save();
            }
            results.push({ index: i, success: true, posts: postHistoryRecords, skipped: true });
            continue;
          }

          for (const socialPost of postHistoryRecords) {
            try {
              await socialMediaService.publishContent(
                SocialAccount, socialPost._id, userId,
                socialPost.media_urls, finalCaption, socialPost.content_type,
                socialPost.platform, baseUrl, io
              );

              const updatedPost = await SocialPost.findById(socialPost._id);
              if (updatedPost.status !== 'published') {
                allPublished = false;
                failureMessage = updatedPost.error_message || 'Publishing failed';
                if (stopOnError) break;
              } else {
                postsPublishedToday++;
              }
            } catch (error) {
              console.error(`Bulk publishing failed for post ${socialPost._id}:`, error);
              allPublished = false;
              failureMessage = error.message;
              if (stopOnError) break;
            }
          }
        }

        if (allPublished) {
          results.push({ index: i, success: true, posts: postHistoryRecords });
        } else {
          errors.push({ index: i, message: failureMessage, item: postItem });
          if (stopOnError) break;
        }

        if (i < posts.length - 1 && intervalMs > 0 && !isScheduled) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      } catch (itemError) {
        errors.push({ index: i, message: itemError.message, item: postItem });
        if (stopOnError) break;
      }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    return res.status(200).json({
      success: true,
      message: `Bulk publish completed: ${successCount} succeeded, ${errorCount} failed.`,
      data: {
        succeeded: results,
        failed: errors,
        summary: { total: posts.length, succeeded: successCount, failed: errorCount }
      }
    });

  } catch (error) {
    console.error('Error in bulk publish:', error);
    res.status(500).json({ message: error.message || 'Failed to process bulk publish' });
  }
};
