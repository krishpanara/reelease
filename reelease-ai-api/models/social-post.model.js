const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const SocialPostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'SocialAccount',
      required: true,
      index: true
    },
    platform: {
      type: String,
      required: true,
      enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'threads'],
      index: true
    },
    post_id: {
      type: String,
      default: 'PENDING',
      index: true
    },
    post_url: {
      type: String,
      default: null
    },
    content_type: {
      type: String,
      required: true,
      enum: ['post', 'story', 'reel', 'feed', 'video', 'article', 'shorts', 'videos']
    },
    caption: {
      type: String,
      default: ''
    },
    first_comment: {
      type: String,
      default: null
    },
    media_urls: {
      type: [String],
      default: []
    },
    metadata: {
      type: Object,
      default: {}
    },
    status: {
      type: String,
      enum: ['scheduled', 'pending', 'published', 'failed', 'deleted', 'cancelled'],
      default: 'pending'
    },
    scheduled_at: {
      type: Date,
      default: null
    },
    error_message: {
      type: String,
      default: null
    },
    published_at: {
      type: Date,
      default: null
    },
    deleted_at: {
      type: Date,
      default: null
    }
  },

  {
    collection: 'social_posts',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(SocialPostSchema);

SocialPostSchema.index({ user: 1, platform: 1 });
SocialPostSchema.index({ user: 1, published_at: -1 });
SocialPostSchema.index({ account: 1, status: 1 });
SocialPostSchema.index({ status: 1, scheduled_at: 1 });

module.exports = mongoose.model('SocialPost', SocialPostSchema);
