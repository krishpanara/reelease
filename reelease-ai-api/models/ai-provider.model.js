const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const ServiceConfigSchema = new Schema(
  {
    enabled: {
      type: Boolean,
      default: false
    },
    base_url: {
      type: String,
      default: null
    },
    api_key: {
      type: String,
      default: null
    },
    auth_type: {
      type: String,
      default: 'Bearer Token'
    },
    create_job_request: {
      method: { type: String, default: 'POST' },
      endpoint: { type: String, default: null },
      payload: { type: String, default: null },
      job_id_path: { type: String, default: null }
    },
    poll_job_status: {
      method: { type: String, default: 'GET' },
      endpoint: { type: String, default: null },
      state_path: { type: String, default: null },
      success_state_value: { type: String, default: null },
      failed_state_value: { type: String, default: null },
      result_media_url_path: { type: String, default: null }
    }
  },
  { _id: false }
);

const AIProviderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    text_to_image: {
      type: ServiceConfigSchema,
      default: () => ({})
    },
    image_to_image: {
      type: ServiceConfigSchema,
      default: () => ({})
    },
    video_motion: {
      type: ServiceConfigSchema,
      default: () => ({})
    },
    images_to_video: {
      type: ServiceConfigSchema,
      default: () => ({})
    },
    text_to_video: {
      type: ServiceConfigSchema,
      default: () => ({})
    }
  },
  {
    collection: 'ai_providers',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

addVirtualId(AIProviderSchema);

module.exports = mongoose.model('AIProvider', AIProviderSchema);
