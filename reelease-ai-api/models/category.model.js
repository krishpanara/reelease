const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: ''
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    image_id: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
      default: null
    },
    meta_title: {
      type: String,
      default: ''
    },
    meta_description: {
      type: String,
      default: ''
    },
    meta_image_id: {
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
    collection: 'categories',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(CategorySchema);

CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent_id: 1 });
CategorySchema.index({ status: 1 });

module.exports = mongoose.model('Category', CategorySchema);
