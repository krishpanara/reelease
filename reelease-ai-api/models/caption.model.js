const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const CaptionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: ['manual', 'ai'],
      default: 'manual',
      lowercase: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
      lowercase: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    notes: {
      type: String,
      trim: true
    }
  },
  {
    collection: 'captions',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

addVirtualId(CaptionSchema);

module.exports = mongoose.model('Caption', CaptionSchema);
