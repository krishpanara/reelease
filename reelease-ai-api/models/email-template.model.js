const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const EmailTemplateSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true
    },
    subject: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'email_templates',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(EmailTemplateSchema);

EmailTemplateSchema.index({ slug: 1 });

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);
