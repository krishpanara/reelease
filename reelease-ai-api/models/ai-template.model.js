const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const AITemplateSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    attachment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
      required: true
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'AITemplateCategory',
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    prompt: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'ai_templates',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

AITemplateSchema.index({ category_id: 1, prompt: 1, attachment_id: 1 }, { unique: true });

addVirtualId(AITemplateSchema);

module.exports = mongoose.model('AITemplate', AITemplateSchema);
