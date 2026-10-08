const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const SettingSchema = new Schema(
  {
    app_name: {
      type: String,
      default: 'My Application'
    },
    app_description: {
      type: String,
      default: 'AI Builder'
    },
    app_email: {
      type: String,
      default: 'support@example.com',
      required: true
    },
    support_email: {
      type: String,
      default: 'support@example.com',
      required: true
    },
    favicon_url: {
      type: String,
      default: null
    },
    logo_dark_url: {
      type: String,
      default: null
    },
    logo_light_url: {
      type: String,
      default: null
    },
    sidebar_logo_url: {
      type: String,
      default: null
    },
    sidebar_light_logo_url: {
      type: String,
      default: null
    },
    sidebar_light_logo_url: {
      type: String,
      default: null
    },
    maintenance_mode: {
      type: Boolean,
      default: false,
      required: true
    },
    maintenance_title: {
      type: String,
      default: 'Under Maintenance'
    },
    maintenance_message: {
      type: String,
      default: 'We are performing some maintenance. Please check back later.'
    },
    maintenance_image_url: {
      type: String,
      default: null
    },
    maintenance_allowed_ips: {
      type: [String],
      default: []
    },

    page_404_title: {
      type: String,
      default: 'Page Not Found'
    },
    page_404_content: {
      type: String,
      default: 'The page you are looking for does not exist.'
    },
    page_404_image_url: {
      type: String,
      default: null
    },
    no_internet_title: {
      type: String,
      default: 'No Internet Connection'
    },
    no_internet_content: {
      type: String,
      default: 'Please check your internet connection and try again.'
    },
    no_internet_image_url: {
      type: String,
      default: null
    },

    smtp_host: {
      type: String,
      default: null
    },
    smtp_port: {
      type: Number,
      default: 587
    },
    smtp_user: {
      type: String,
      default: null
    },
    smtp_pass: {
      type: String,
      default: null
    },
    mail_from_name: {
      type: String,
      default: 'My Application'
    },
    mail_from_email: {
      type: String,
      default: 'noreply@myapplication.com'
    },
    mail_encryption: {
      type: String, enum: ['ssl', 'tls'],
      default: 'tls',
      required: true
    },
    otp_message: {
      type: String,
      default: null
    },
    plan_renewal_reminder_days: {
      type: Number,
      default: 3
    },
    session_expiration_days: {
      type: Number,
      default: 7
    },
    session_limit: {
      type: Number,
      default: 10
    },
    document_file_limit: {
      type: Number,
      default: 15
    },
    audio_file_limit: {
      type: Number,
      default: 15
    },
    video_file_limit: {
      type: Number,
      default: 20
    },
    image_file_limit: {
      type: Number,
      default: 10
    },
    multiple_file_share_limit: {
      type: Number,
      default: 10
    },
    maximum_message_length: {
      type: Number,
      default: 40000
    },
    allowed_file_upload_types: {
      type: Object,
      default: null
    },
    is_demo_mode: {
      type: Boolean,
      default: false
    },
    demo_user_email: {
      type: String,
      default: null
    },
    demo_user_password: {
      type: String,
      default: null
    },
    default_language: {
      type: String,
      default: 'en'
    },
    enable_trial: {
      type: Boolean,
      default: true
    },
    trial_days_limit: {
      type: Number,
      default: 14
    },
    stripe_secret_key: {
      type: String,
      default: null
    },
    stripe_webhook_secret: {
      type: String,
      default: null
    },
    razorpay_key_id: {
      type: String,
      default: null
    },
    razorpay_key_secret: {
      type: String,
      default: null
    },
    razorpay_webhook_secret: {
      type: String,
      default: null
    },
    paypal_client_id: {
      type: String,
      default: null
    },
    paypal_client_secret: {
      type: String,
      default: null
    },
    paypal_mode: {
      type: String,
      enum: ['sandbox', 'live'],
      default: 'sandbox'
    },
    enable_manual_payment: {
      type: Boolean,
      default: false
    },
    bank_details: {
      type: Object,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    active_ai_provider_id: {
      type: Schema.Types.ObjectId,
      ref: 'AIProvider',
      default: null
    },
    registration_free_credits: {
      type: Number,
      default: 0
    },
    registration_free_caption_credits: {
      type: Number,
      default: 0
    },
    channel_limit: {
      type: Number,
      default: 2
    },
    watermark_enabled: { type: Boolean, default: false },
    watermark_type: { type: String, enum: ['image', 'text'], default: 'text' },
    watermark_text: { type: String, default: 'My Watermark' },
    watermark_image_url: { type: String, default: null },
    watermark_position: { type: String, default: 'bottom-right' }, // top-left, top-right, bottom-left, bottom-right, center
    watermark_opacity: { type: Number, default: 100 },
    watermark_scale: { type: Number, default: 88 },
    watermark_rotation: { type: Number, default: 0 },
    watermark_font: { type: String, default: 'Inter' },
    watermark_font_weight: { type: String, default: 'Bold' },
    watermark_italic: { type: Boolean, default: false },
    watermark_underline: { type: Boolean, default: false },
    watermark_style: { type: String, default: 'Solid' },
    watermark_color: { type: String, default: 'White' },
    watermark_blend_mode: { type: String, default: 'normal' },
    watermark_tiling: { type: Boolean, default: false },
    watermark_padding: { type: Number, default: 10 },

    facebook_app_id: { type: String, default: null },
    facebook_app_secret: { type: String, default: null },
    facebook_api_version: { type: String, default: 'v18.0' },
    threads_app_id: { type: String, default: null },
    threads_app_secret: { type: String, default: null },
    linkedin_client_id: { type: String, default: '' },
    linkedin_client_secret: { type: String, default: '' },
    twitter_consumer_key: { type: String, default: '' },
    twitter_consumer_secret: { type: String, default: '' },
    twitter_oauth_token: { type: String, default: '' },
    twitter_oauth_token_secret: { type: String, default: '' },
    twitter_client_id: { type: String, default: '' },
    twitter_client_secret: { type: String, default: '' },
    youtube_client_id: { type: String, default: '' },
    youtube_client_secret: { type: String, default: '' },
  },
  {
    collection: 'settings',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

addVirtualId(SettingSchema);

module.exports = mongoose.model('Setting', SettingSchema);
