const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const AICaptionModelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    model_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    provider: {
      type: String,
      enum: ['gemini', 'openai'],
      required: true
    },
    api_key: {
      type: String,
      required: true,
      trim: true
    },
    is_default: {
      type: Boolean,
      default: false
    },
    is_active: {
      type: Boolean,
      default: true
    },
    credit_cost: {
      type: Number,
      required: true,
      min: 1,
      default: 10
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    max_output_tokens: {
      type: Number,
      default: 500
    }
  },
  {
    collection: 'ai_caption_models',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

AICaptionModelSchema.index({ model_id: 1 }, { unique: true });
AICaptionModelSchema.index({ is_default: 1 });
AICaptionModelSchema.index({ is_active: 1 });
AICaptionModelSchema.index({ provider: 1 });

addVirtualId(AICaptionModelSchema);

module.exports = mongoose.model('AICaptionModel', AICaptionModelSchema);
