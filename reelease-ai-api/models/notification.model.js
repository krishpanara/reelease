const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['social-publish', 'ai-task', 'system'],
      default: 'system'
    },
    data: {
      type: Schema.Types.Mixed,
      default: {}
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    collection: 'notifications',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(NotificationSchema);

NotificationSchema.index({ user: 1, is_read: 1, created_at: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
