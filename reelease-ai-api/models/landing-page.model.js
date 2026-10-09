const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addVirtualId } = require('../utils/modelHelper');

const FeatureItemSchema = new Schema({
  title: { type: String, default: null },
  description: { type: String, default: null },
  image_id: { type: Schema.Types.ObjectId, ref: 'Attachment', default: null },
  color: { type: String, default: 'text-blue-400' }
}, { _id: true });

const SocialFeatureSchema = new Schema({
  icon: { type: String, default: null },
  title: { type: String, default: null },
  description: { type: String, default: null },
  image_id: { type: Schema.Types.ObjectId, ref: 'Attachment', default: null }
}, { _id: true });

const SocialPlatformSchema = new Schema({
  platform_id: { type: String, default: null },
  name: { type: String, default: null },
  badge: { type: String, default: null },
  title: { type: String, default: null },
  highlight: { type: String, default: null },
  description: { type: String, default: null },
  image_id: { type: Schema.Types.ObjectId, ref: 'Attachment', default: null },
  features: [SocialFeatureSchema]
}, { _id: true });

const StatItemSchema = new Schema({
  val: { type: String, default: null },
  label: { type: String, default: null }
}, { _id: true });

const SocialLinkSchema = new Schema({
  name: { type: String, default: null },
  href: { type: String, default: '#' },
  icon: { type: String, default: null }
}, { _id: true });

const LandingPageSchema = new Schema(
  {
    hero: {
      badge: { type: String, default: 'Next-Gen AI Platform' },
      heading: { type: String, default: 'Create Viral AI Videos and Reels in Minutes' },
      subheading: { type: String, default: null },
      cta_primary_text: { type: String, default: 'Get Started Now' },
      cta_secondary_text: { type: String, default: 'Explore Features' },
      dashboard_image_id: { type: Schema.Types.ObjectId, ref: 'Attachment', default: null }
    },
    features: {
      section_badge: { type: String, default: 'Powerful Capabilities' },
      section_heading: { type: String, default: 'Everything You Need to Create Content' },
      section_subheading: { type: String, default: null },
      items: [FeatureItemSchema]
    },

    social: {
      platforms: [SocialPlatformSchema]
    },

    stats: {
      items: [StatItemSchema]
    },

    pricing: {
      badge: { type: String, default: 'Pricing' },
      title: { type: String, default: 'Simple, Transparent Pricing' },
      description: { type: String, default: null },
      plan_ids: [{ type: Schema.Types.ObjectId, ref: 'Plan' }]
    },

    blog: {
      badge: { type: String, default: 'Latest Insights' },
      title: { type: String, default: 'From Our Blog' },
      description: { type: String, default: null },
      blog_ids: [{ type: Schema.Types.ObjectId, ref: 'Blog' }]
    },

    testimonials: {
      section_badge: { type: String, default: 'Wall of Love' },
      section_heading: { type: String, default: 'Trusted by 100K+ Creators Worldwide' },
      section_subheading: { type: String, default: null },
      testimonial_ids: [{ type: Schema.Types.ObjectId, ref: 'Testimonial' }]
    },

    faq: {
      section_badge: { type: String, default: 'Common Questions' },
      section_heading: { type: String, default: 'Frequently Asked Questions' },
      section_subheading: { type: String, default: null },
      faq_ids: [{ type: Schema.Types.ObjectId, ref: 'Faq' }]
    },

    contact: {
      section_badge: { type: String, default: 'Get In Touch' },
      heading: { type: String, default: 'Have Questions? We Have Answers' },
      subheading: { type: String, default: null },
      email: { type: String, default: 'info@omfinitive.com' },
      phone: { type: String, default: '+91 99794 57999' },
      address: { type: String, default: null },
      live_chat_label: { type: String, default: 'Available 24/7' }
    },

    footer: {
      tagline: { type: String, default: null },
      copyright: { type: String, default: '© 2026 Social Ominfinitive. All Rights Reserved.' },
      address: { type: String, default: 'Africa • Qatar • USA' },
      phone: { type: String, default: '+91 99794 57999' },
      email: { type: String, default: 'info@omfinitive.com' },
      social_links: [SocialLinkSchema]
    }
  },
  {
    collection: 'landing_page',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

addVirtualId(LandingPageSchema);

module.exports = mongoose.model('LandingPage', LandingPageSchema);
