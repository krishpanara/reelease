const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const AITemplateCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    attachment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
      default: null
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'ai_template_categories',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

addVirtualId(AITemplateCategorySchema);

module.exports = mongoose.model('AITemplateCategory', AITemplateCategorySchema);
