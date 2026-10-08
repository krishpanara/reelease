const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const AIFeatureCreditSchema = new Schema(
  {
    provider_id: {
      type: Schema.Types.ObjectId,
      ref: 'AIProvider',
      required: true
    },
    feature_key: {
      type: String,
      required: true,
      trim: true
    },
    display_name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    icon: {
      type: String,
      trim: true,
      default: null
    },
    credits: {
      type: Number,
      required: true,
      default: 0
    },
    is_per_second: {
      type: Boolean,
      default: false
    }
  },
  {
    collection: 'ai_feature_credits',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

AIFeatureCreditSchema.index({ provider_id: 1, feature_key: 1 }, { unique: true });

addVirtualId(AIFeatureCreditSchema);

module.exports = mongoose.model('AIFeatureCredit', AIFeatureCreditSchema);
