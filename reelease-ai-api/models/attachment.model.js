const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const AttachmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    file_path: {
      type: String,
      required: true
    },
    file_type: {
      type: String,
      required: true
    },
    file_size: {
      type: Number,
      required: true
    },
    mime_type: {
      type: String,
      required: true
    },
    is_generated: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }
  },
  {
    collection: 'attachments',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(AttachmentSchema);


module.exports = mongoose.model('Attachment', AttachmentSchema);
