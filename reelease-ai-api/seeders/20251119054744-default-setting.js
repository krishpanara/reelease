const Setting = require('../models/setting.model');

const defaultSettings = {
  app_name: 'Social Ominfinitive',
  app_description: 'A modern AI Builder application',
  app_email: 'support@example.com',
  support_email: 'support@example.com',

  favicon_url: '/uploads/logos/favicon.png',
  logo_light_url: '/uploads/logos/light-logo1.png',
  logo_dark_url: '/uploads/logos/dark_logo.png',
  sidebar_logo_url: '/uploads/logos/sidebar_logo.png',
  sidebar_light_logo_url: '/uploads/logos/sidebar_light_logo.png',

  maintenance_mode: false,
  maintenance_title: 'Under Maintenance',
  maintenance_message: 'We are performing some maintenance. Please check back later.',
  maintenance_image_url: '',
  maintenance_allowed_ips: [],

  page_404_title: 'Page Not Found',
  page_404_content: 'The page you are looking for does not exist.',
  page_404_image_url: '',
  no_internet_title: 'No Internet Connection',
  no_internet_content: 'Please check your internet connection and try again.',
  no_internet_image_url: '',

  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_pass: '',
  mail_from_name: 'My Application',
  mail_from_email: 'noreply@myapplication.com',
  mail_encryption: 'tls',
  otp_message: 'Your verification code is: {otp}',

  plan_renewal_reminder_days: 3,
  session_expiration_days: 7,
  session_limit: 10,

  document_file_limit: 15,
  audio_file_limit: 15,
  video_file_limit: 20,
  image_file_limit: 10,
  multiple_file_share_limit: 10,
  maximum_message_length: 40000,
  allowed_file_upload_types: null,

  is_demo_mode: false,
  demo_user_email: null,
  demo_user_password: null,
  default_language: 'en',

  enable_trial: true,
  trial_days_limit: 14,
  stripe_secret_key: null,
  stripe_webhook_secret: null,
  razorpay_key_id: null,
  razorpay_key_secret: null,
  razorpay_webhook_secret: null,
  paypal_client_id: null,
  paypal_client_secret: null,
  paypal_mode: 'sandbox',
  enable_manual_payment: false,
  bank_details: null,
  currency: 'USD',

  registration_free_credits: 0,
  registration_free_caption_credits: 0,
  channel_limit: 2,

  watermark_enabled: false,
  watermark_type: 'text',
  watermark_text: 'My Watermark',
  watermark_image_url: null,
  watermark_position: 'bottom-right',
  watermark_opacity: 100,
  watermark_scale: 88,
  watermark_rotation: 0,
  watermark_font: 'Inter',
  watermark_font_weight: 'Bold',
  watermark_italic: false,
  watermark_underline: false,
  watermark_style: 'Solid',
  watermark_color: 'White',
  watermark_blend_mode: 'normal',
  watermark_tiling: false,
  watermark_padding: 10,

  facebook_app_id: null,
  facebook_app_secret: null,
  facebook_api_version: 'v18.0',
  threads_app_id: null,
  threads_app_secret: null,
  linkedin_client_id: '',
  linkedin_client_secret: '',
  twitter_consumer_key: '',
  twitter_consumer_secret: '',
  twitter_oauth_token: '',
  twitter_oauth_token_secret: '',
  twitter_client_id: '',
  twitter_client_secret: '',
  youtube_client_id: '',
  youtube_client_secret: '',
};

async function up(dbConnection, mongoose) {
  try {
    const SettingModel = dbConnection.db.Setting || require('../models/setting.model');
    const AIProvider = dbConnection.db.AIProvider || require('../models/ai-provider.model');
    const kieProvider = await AIProvider.findOne({ name: 'Kie.ai' });

    const settingsData = { ...defaultSettings };
    if (kieProvider) {
      settingsData.active_ai_provider_id = kieProvider._id;
    }

    const existingSetting = await SettingModel.findOne({});
    if (existingSetting) {
      let isUpdated = false;
      for (const key of Object.keys(settingsData)) {
        if (existingSetting[key] === undefined || existingSetting[key] === null || existingSetting[key] === '') {
          existingSetting[key] = settingsData[key];
          isUpdated = true;
        }
      }
      if (isUpdated) {
        await existingSetting.save();
        console.log('Settings updated successfully with missing keys!');
      }
    } else {
      const setting = new SettingModel(settingsData);
      await setting.save();
      console.log('Settings seeded successfully!');
    }

  } catch (error) {
    console.error('Error seeding settings:', error);
    throw error;
  }
}

async function down(dbConnection, mongoose) {
  try {
    const SettingModel = dbConnection.db.Setting || require('../models/setting.model');

    await SettingModel.deleteMany({});
  } catch (error) {
    console.error('Error removing settings:', error);
    throw error;
  }
}

module.exports = { up, down };