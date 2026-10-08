const { db } = require('../models');
const LandingPage = db.LandingPage;
const mongoose = require('mongoose');

const extractId = (val) => {
  if (val && typeof val === 'object') {
    if (mongoose.Types.ObjectId.isValid(val._id)) return val._id;
    if (mongoose.Types.ObjectId.isValid(val.id)) return val.id;
  }
  if (mongoose.Types.ObjectId.isValid(val)) return val;
  return null;
};


const getPopulatedLandingPage = () => {
  return LandingPage.findOne()
    .populate('hero.dashboard_image_id', 'file_path name mime_type')
    .populate('features.items.image_id', 'file_path name mime_type')
    .populate({
      path: 'social.platforms',
      populate: [
        { path: 'image_id', select: 'file_path name mime_type' },
        { path: 'features.image_id', select: 'file_path name mime_type' }
      ]
    }).populate('pricing.plan_ids')
    .populate({
      path: 'blog.blog_ids',
      select: 'title slug description thumbnail_id created_at',
      populate: {
        path: 'thumbnail_id',
        select: 'file_path'
      }
    }).populate('testimonials.testimonial_ids').populate('faq.faq_ids');
};

const transformLandingPage = (landingPage) => {
  if (landingPage && landingPage.blog && Array.isArray(landingPage.blog.blog_ids)) {
    landingPage.blog.blog_ids = landingPage.blog.blog_ids.map(blog => ({
      ...blog,
      thumbnail_id: blog.thumbnail_id?.file_path || null
    }));
  }
  return landingPage;
};


exports.getLandingPage = async (req, res) => {
  try {
    let landingPage = await getPopulatedLandingPage().lean({ virtuals: true });

    if (!landingPage) {
      const newPage = new LandingPage({});
      await newPage.save();
      landingPage = await getPopulatedLandingPage().lean({ virtuals: true });
    }

    landingPage = transformLandingPage(landingPage);

    return res.status(200).json({
      message: 'Landing page fetched successfully',
      landing_page: landingPage
    });
  } catch (error) {
    console.error('Get landing page error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateLandingPage = async (req, res) => {
  try {
    const body = req.body;
    const updateData = {};

    if (body.hero !== undefined) {
      const hero = typeof body.hero === 'string' ? JSON.parse(body.hero) : body.hero;
      updateData.hero = {};
      const heroFields = ['badge', 'heading', 'subheading', 'cta_primary_text', 'cta_secondary_text'];
      heroFields.forEach(f => { if (hero[f] !== undefined) updateData.hero[f] = hero[f] || null; });
      if (hero.dashboard_image_id !== undefined) updateData.hero.dashboard_image_id = extractId(hero.dashboard_image_id);
    }

    if (body.features !== undefined) {
      const features = typeof body.features === 'string' ? JSON.parse(body.features) : body.features;
      updateData.features = {};
      const sectionFields = ['section_badge', 'section_heading', 'section_subheading'];
      sectionFields.forEach(f => { if (features[f] !== undefined) updateData.features[f] = features[f] || null; });
      if (Array.isArray(features.items)) {
        updateData.features.items = features.items.map(item => ({
          title: item.title || null,
          description: item.description || null,
          image_id: extractId(item.image_id),
          color: item.color || 'text-blue-400'
        }));
      }
    }

    if (body.social !== undefined) {
      const social = typeof body.social === 'string' ? JSON.parse(body.social) : body.social;
      if (Array.isArray(social.platforms)) {
        updateData.social = {
          platforms: social.platforms.map(p => ({
            platform_id: p.platform_id || null,
            name: p.name || null,
            badge: p.badge || null,
            title: p.title || null,
            highlight: p.highlight || null,
            description: p.description || null,
            image_id: extractId(p.image_id),
            features: Array.isArray(p.features) ? p.features.map(f => ({
              icon: f.icon || null,
              title: f.title || null,
              description: f.description || null,
              image_id: extractId(f.image_id)
            })) : []
          }))
        };
      }
    }

    if (body.stats !== undefined) {
      const stats = typeof body.stats === 'string' ? JSON.parse(body.stats) : body.stats;
      if (Array.isArray(stats.items)) {
        updateData.stats = {
          items: stats.items.map(s => ({
            val: s.val || null,
            label: s.label || null
          }))
        };
      }
    }

    if (body.pricing !== undefined) {
      const pricing = typeof body.pricing === 'string' ? JSON.parse(body.pricing) : body.pricing;
      updateData.pricing = {};
      ['badge', 'title', 'description'].forEach(f => {
        if (pricing[f] !== undefined) updateData.pricing[f] = pricing[f] || null;
      });
      if (Array.isArray(pricing.plan_ids)) {
        updateData.pricing.plan_ids = pricing.plan_ids.map(id => extractId(id)).filter(id => id);
      }
    }

    if (body.blog !== undefined) {
      const blog = typeof body.blog === 'string' ? JSON.parse(body.blog) : body.blog;
      updateData.blog = {};
      ['badge', 'title', 'description'].forEach(f => {
        if (blog[f] !== undefined) updateData.blog[f] = blog[f] || null;
      });
      if (Array.isArray(blog.blog_ids)) {
        updateData.blog.blog_ids = blog.blog_ids.map(id => extractId(id)).filter(id => id);
      }
    }

    if (body.testimonials !== undefined) {
      const testimonials = typeof body.testimonials === 'string' ? JSON.parse(body.testimonials) : body.testimonials;
      updateData.testimonials = {};
      ['section_badge', 'section_heading', 'section_subheading'].forEach(f => {
        if (testimonials[f] !== undefined) updateData.testimonials[f] = testimonials[f] || null;
      });
      if (Array.isArray(testimonials.testimonial_ids)) {
        updateData.testimonials.testimonial_ids = testimonials.testimonial_ids.map(id => extractId(id)).filter(id => id);
      }
    }

    if (body.faq !== undefined) {
      const faq = typeof body.faq === 'string' ? JSON.parse(body.faq) : body.faq;
      updateData.faq = {};
      ['section_badge', 'section_heading', 'section_subheading'].forEach(f => {
        if (faq[f] !== undefined) updateData.faq[f] = faq[f] || null;
      });
      if (Array.isArray(faq.faq_ids)) {
        updateData.faq.faq_ids = faq.faq_ids.map(id => extractId(id)).filter(id => id);
      }
    }

    if (body.contact !== undefined) {
      const contact = typeof body.contact === 'string' ? JSON.parse(body.contact) : body.contact;
      updateData.contact = {};
      ['section_badge', 'heading', 'subheading', 'email', 'phone', 'address', 'live_chat_label'].forEach(f => {
        if (contact[f] !== undefined) updateData.contact[f] = contact[f] || null;
      });
    }

    if (body.footer !== undefined) {
      const footer = typeof body.footer === 'string' ? JSON.parse(body.footer) : body.footer;
      updateData.footer = {};
      ['tagline', 'copyright', 'address', 'phone', 'email'].forEach(f => {
        if (footer[f] !== undefined) updateData.footer[f] = footer[f] || null;
      });
      if (Array.isArray(footer.social_links)) {
        updateData.footer.social_links = footer.social_links.map(s => ({
          name: s.name || null,
          href: s.href || '#',
          icon: s.icon || null
        }));
      }
    }

    await LandingPage.updateOne({}, { $set: updateData }, { upsert: true });

    const updated = await getPopulatedLandingPage().lean({ virtuals: true });
    const transformed = transformLandingPage(updated);

    return res.status(200).json({
      message: 'Landing page updated successfully',
      landing_page: transformed
    });
  } catch (error) {
    console.error('Update landing page error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
