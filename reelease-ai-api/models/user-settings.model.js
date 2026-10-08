const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const UserSettingsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    watermark_enabled: { type: Boolean, default: false },
    watermark_type: { type: String, enum: ['image', 'text'], default: 'text' },
    watermark_text: { type: String, default: 'My Watermark' },
    watermark_image_url: { type: String, default: null },
    watermark_position: { type: String, default: 'bottom-right' },
    watermark_opacity: { type: Number, default: 100 },
    watermark_scale: { type: Number, default: 88 },
    watermark_rotation: { type: Number, default: 0 },
    watermark_font: { type: String, default: 'Inter' },
    watermark_font_weight: { type: String, default: 'Bold' },
    watermark_italic: { type: Boolean, default: false },
    watermark_underline: { type: Boolean, default: false },
    watermark_style: { type: String, default: 'Solid' },
    watermark_color: { type: String, default: 'White' },
    watermark_blend_mode: { type: String, default: 'normal' },
    watermark_tiling: { type: Boolean, default: false },
    watermark_padding: { type: Number, default: 10 },
  },
  {
    collection: 'usersettings',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(UserSettingsSchema);

UserSettingsSchema.index({ user: 1 });

module.exports = mongoose.model('UserSettings', UserSettingsSchema);
