// Points the landing page at the real images in uploads/landing-page instead of
// the placeholder SVGs the seeder starts with. Safe to run repeatedly: it only
// replaces images that are missing, a placeholder, or the old hero screenshot,
// so images an admin picks later in the panel are left alone.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Attachment = require('../models/attachment.model');

const DIR = 'landing-page';
const HERO_IMAGE = 'socialominfitive-ai-dashboard.png';
const REPLACEABLE = ['1050x600.svg', '520x410.svg', '340x600.svg', 'hero-dashboard.png'];

const FEATURE_IMAGES = [
  'feature-text-to-image.png',
  'feature-image-to-image.png',
  'feature-text-to-video.png',
  'feature-image-to-video.png',
  'feature-video-motion.png',
  'feature-characters.png',
  'feature-ecommerce.png',
];

// Per social platform: [card image, [tab images]]
const SOCIAL_IMAGES = [
  ['social-story.png', ['social-story.png', 'social-reels.png', 'social-post.png']],
  ['social-f-story.png', ['social-f-story.png', 'social-f-reels.png', 'social-f-post.png']],
  ['social-post.png', ['social-post.png', 'social-post.png', 'social-post.png']],
  ['social-post.png', ['social-post.png', 'social-post.png', 'social-post.png']],
  ['social-reels.png', ['social-reels.png', 'social-post.png', 'social-post.png']],
  ['social-post.png', ['social-post.png', 'social-post.png', 'social-post.png']],
];

const cache = {};
async function attachmentId(fileName) {
  if (cache[fileName]) return cache[fileName];
  const filePath = `/uploads/${DIR}/${fileName}`;
  let att = await Attachment.findOne({ file_path: filePath });
  if (!att) {
    const diskPath = path.join(__dirname, '..', 'uploads', DIR, fileName);
    if (!fs.existsSync(diskPath)) throw new Error(`Missing image file: ${diskPath}`);
    att = await Attachment.create({
      name: fileName,
      file_path: filePath,
      file_type: 'image',
      file_size: fs.statSync(diskPath).size,
      mime_type: 'image/png',
    });
  }
  return (cache[fileName] = att._id);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const landing = mongoose.connection.db.collection('landing_page');

  const replaceable = (
    await Attachment.find({ file_path: { $in: REPLACEABLE.map((f) => `/uploads/${DIR}/${f}`) } }).select('_id')
  ).map((a) => String(a._id));
  const shouldReplace = (id) => !id || replaceable.includes(String(id));

  let changed = 0;
  for (const doc of await landing.find().toArray()) {
    const set = {};

    if (doc.hero && shouldReplace(doc.hero.dashboard_image_id)) {
      set['hero.dashboard_image_id'] = await attachmentId(HERO_IMAGE);
    }

    (doc.features?.items || []).forEach((item, i) => {
      if (FEATURE_IMAGES[i] && shouldReplace(item.image_id)) set[`features.items.${i}.image_id`] = FEATURE_IMAGES[i];
    });

    (doc.social?.platforms || []).forEach((platform, i) => {
      const [card, tabs] = SOCIAL_IMAGES[i] || [];
      if (card && shouldReplace(platform.image_id)) set[`social.platforms.${i}.image_id`] = card;
      (platform.features || []).forEach((feature, j) => {
        if (tabs?.[j] && shouldReplace(feature.image_id)) set[`social.platforms.${i}.features.${j}.image_id`] = tabs[j];
      });
    });

    for (const key of Object.keys(set)) {
      if (typeof set[key] === 'string') set[key] = await attachmentId(set[key]);
    }
    if (Object.keys(set).length) {
      await landing.updateOne({ _id: doc._id }, { $set: set });
      changed += Object.keys(set).length;
    }
  }

  console.log(`Landing page images: ${changed} image(s) updated`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Landing image update failed:', err);
  process.exit(1);
});
