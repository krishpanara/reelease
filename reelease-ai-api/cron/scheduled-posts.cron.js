const cron = require('node-cron');
const { db } = require('../models');
const SocialAccount = db.SocialAccount;
const SocialPost = db.SocialPost;
const socialMediaService = require('../services/socialMediaService');

const processScheduledPosts = async (app) => {
  try {
    const now = new Date();
    const scheduledPosts = await SocialPost.find({
      status: 'scheduled',
      scheduled_at: { $lte: now }
    });

    if (scheduledPosts.length === 0) return;

    const io = app.get('io');
    const baseUrl = process.env.APP_URL || process.env.BASE_URL || 'http://localhost:3000';

    for (const post of scheduledPosts) {
      post.status = 'pending';
      await post.save();

      try {
        console.log(`[CRON] Publishing scheduled post ${post._id} to ${post.platform}`);
        await socialMediaService.publishContent(
          SocialAccount,
          post._id,
          post.user,
          post.media_urls,
          post.caption,
          post.content_type,
          post.platform,
          baseUrl,
          io
        );
      } catch (error) {
        console.error(`[CRON] Failed to publish scheduled post ${post._id}:`, error.message);
        post.status = 'failed';
        post.error_message = error.message;
        await post.save();
        break;
      }
    }
  } catch (error) {
    console.error('[CRON] Error in processScheduledPosts:', error.message);
  }
};

const initScheduledPostsCron = (app) => {
  cron.schedule('* * * * *', () => processScheduledPosts(app), {
    scheduled: true,
    timezone: 'UTC'
  });
  console.log('[CRON] Scheduled Posts scheduler initialized.');
};

module.exports = { initScheduledPostsCron };
