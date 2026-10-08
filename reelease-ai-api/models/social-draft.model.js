const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const SocialDraftSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    accountIds: [{
      type: Schema.Types.ObjectId,
      ref: 'SocialAccount'
    }],
    attachmentIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Attachment'
    }],
    caption: {
      type: String,
      default: ''
    },
    contentTypes: {
      type: [String],
      default: ['post']
    },
    notes: {
      type: String,
      default: ''
    },
    scheduled_at: {
      type: Date,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    collection: 'social_drafts',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(SocialDraftSchema);

SocialDraftSchema.index({ user: 1, created_at: -1 });

module.exports = mongoose.model('SocialDraft', SocialDraftSchema);
