const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  negative_prompt: {
    type: String,
    trim: true,
    default: ''
  },
  image_url: {
    type: String,
    required: true
  },
  style: {
    type: String,
    enum: ['realistic', 'anime', 'cartoon', '3d', 'illustration', 'pixel-art'],
    default: 'realistic'
  },
  resolution: {
    type: String,
    enum: ['512x512', '768x768', '1024x1024', '512x768', '768x512'],
    default: '1024x1024'
  },
  provider: {
    type: String,
    required: true
  },
  model_used: {
    type: String,
    required: true
  },
  credits_used: {
    type: Number,
    default: 0
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  usage_count: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  collection: 'characters',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CharacterSchema.virtual('id').get(function() {
  return this._id.toString();
});

CharacterSchema.index({ user_id: 1, status: 1 });
CharacterSchema.index({ user_id: 1, created_at: -1 });
CharacterSchema.index({ tags: 1 });

module.exports = mongoose.model('Character', CharacterSchema);
