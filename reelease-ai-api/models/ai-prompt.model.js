const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const AIPromptSchema = new Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    collection: 'ai_prompts',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

AIPromptSchema.index({ category: 1, prompt: 1 }, { unique: true });

addVirtualId(AIPromptSchema);

module.exports = mongoose.model('AIPrompt', AIPromptSchema);
