const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const BlogSchema = new Schema(
  {
    title: {
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
      required: [true, 'Description is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    thumbnail_id: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
      required: [true, 'Thumbnail is required']
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
    categories: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category'
        }
      ],
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one category is required']
    },
    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Tag'
        }
      ],
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one tag is required']
    },
    is_featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'blogs',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addVirtualId(BlogSchema);

BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1 });
BlogSchema.index({ is_featured: 1 });

module.exports = mongoose.model('Blog', BlogSchema);
