const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const SocialAccountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    platform: {
      type: String,
      required: true,
      enum: ['facebook', 'instagram', 'youtube', 'linkedin', 'twitter', 'threads'],
      index: true
    },
    account_id: {
      type: String,
      required: true
    },
    account_name: {
      type: String,
      required: true
    },
    account_username: {
      type: String,
      default: null
    },
    access_token: {
      type: String,
      required: true
    },
    refresh_token: {
      type: String,
      default: null
    },
    token_expiry: {
      type: Date,
      default: null
    },
    page_id: {
      type: String,
      default: null
    },
    page_name: {
      type: String,
      default: null
    },
    permissions: {
      type: [String],
      default: []
    },
    profile_picture: {
      type: String,
      default: null
    },
    metadata: {
      type: Object,
      default: {}
    },
    is_active: {
      type: Boolean,
      default: true
    },
    is_paused: {
      type: Boolean,
      default: false,
      index: true
    },
    connected_at: {
      type: Date,
      default: Date.now
    },
    last_used: {
      type: Date,
      default: null
    }
  },
  {
    collection: 'social_accounts',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(SocialAccountSchema);

SocialAccountSchema.index({ user: 1, platform: 1 });
SocialAccountSchema.index({ user: 1, is_active: 1 });
SocialAccountSchema.index({ platform: 1, account_id: 1 });
SocialAccountSchema.index({ token_expiry: 1 });

module.exports = mongoose.model('SocialAccount', SocialAccountSchema);
