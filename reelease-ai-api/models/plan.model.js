'use strict';

const mongoose = require('mongoose');
const { addVirtualId } = require('../utils/modelHelper');

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    plan_type: {
      type: String,
      enum: ['subscription', 'prepaid', 'lifetime', 'top_up'],
      default: 'subscription',
    },
    billing_cycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one_time'],
      default: 'monthly',
    },
    validity_days: {
      type: Number,
      min: 0,
      default: null,
    },
    stripe_product_id: {
      type: String,
      default: null,
    },
    stripe_price_id: {
      type: String,
      default: null,
    },
    stripe_payment_link_id: {
      type: String,
      default: null,
    },
    stripe_payment_link_url: {
      type: String,
      default: null,
    },
    paypal_plan_id: {
      type: String,
      default: null,
    },
    paypal_plan_id_monthly: {
      type: String,
      default: null,
    },
    paypal_plan_id_yearly: {
      type: String,
      default: null,
    },
    razorpay_plan_id: {
      type: String,
      default: null,
    },
    total_credits: {
      type: Number,
      default: 0,
    },
    caption_credits: {
      type: Number,
      default: 0,
      comment: 'Credits specifically for AI caption generation',
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'INR', 'EUR', 'GBP'],
      default: 'USD',
    },
    ai_features: {
      text_to_image: { type: Boolean, default: false },
      image_to_image: { type: Boolean, default: false },
      video_motion: { type: Boolean, default: false },
      images_to_video: { type: Boolean, default: false },
      text_to_video: { type: Boolean, default: false },
      ai_caption_generator: { type: Boolean, default: false },
      ecommerce_catalogue: { type: Boolean, default: false },
      character_generation: { type: Boolean, default: false }
    },
    channel_limit: {
      type: Number,
      default: null
    },
    remove_watermark: {
      type: Boolean,
      default: false
    },
    features: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: 'plans',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PlanSchema.virtual('allowed_payment_gateways').get(function () {
  const gateways = [];
  if (this.stripe_product_id && this.stripe_price_id && this.stripe_payment_link_url) gateways.push('stripe');
  if (this.razorpay_plan_id) gateways.push('razorpay');
  if (this.paypal_plan_id || this.paypal_plan_id_monthly || this.paypal_plan_id_yearly) gateways.push('paypal');
  return gateways;
});

addVirtualId(PlanSchema);

PlanSchema.index({ slug: 1 }, { unique: true });
PlanSchema.index({ status: 1 });

PlanSchema.methods.isFreePlan = function () {
  return this.amount === 0;
};

module.exports = mongoose.model('Plan', PlanSchema);
