const path = require('path');
const fs = require('fs');

const LandingPage = require('../models/landing-page.model');

async function seedAttachment(Attachment, { srcPath, destSubDir, fileName, mimeType, fileType }) {
  const destDir = path.join(process.cwd(), 'uploads', destSubDir);
  const destFile = path.join(destDir, fileName);
  const filePath = `/uploads/${destSubDir}/${fileName}`;

  const existing = await Attachment.findOne({ file_path: filePath });
  if (existing) {
    return existing;
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠ Source file not found, skipping: ${srcPath}`);
    return null;
  }
  fs.copyFileSync(srcPath, destFile);

  const stat = fs.statSync(destFile);

  const attachment = new Attachment({
    name: fileName,
    file_path: filePath,
    file_type: fileType,
    file_size: stat.size,
    mime_type: mimeType,
  });
  await attachment.save();
  console.log(`  ✓ Attachment created: ${filePath}`);
  return attachment;
}

async function up({ db: dbModels }) {
  try {
    const LandingPageModel = dbModels.LandingPage || LandingPage;
    const Attachment = dbModels.Attachment || require('../models/attachment.model');
    const Plan = dbModels.Plan || require('../models/plan.model');
    const Faq = dbModels.Faq || require('../models/faq.model');
    const Testimonial = dbModels.Testimonial || require('../models/testimonial.model');
    const Blog = dbModels.Blog || require('../models/blog.model');

    const publicLogosDir = path.join(process.cwd(), 'public', 'logos');

    const logoFiles = [
      { fileName: 'dark_logo.png', mimeType: 'image/png' },
      { fileName: 'favicon.png', mimeType: 'image/png' },
      { fileName: 'onboarding_logo.png', mimeType: 'image/png' },
      { fileName: 'sidebar_logo.png', mimeType: 'image/png' },
    ];

    const logoAttachments = {};
    for (const logo of logoFiles) {
      const att = await seedAttachment(Attachment, {
        srcPath: path.join(publicLogosDir, logo.fileName),
        destSubDir: 'logos',
        fileName: logo.fileName,
        mimeType: logo.mimeType,
        fileType: 'image',
      });
      if (att) logoAttachments[logo.fileName] = att;
    }

    const publicLPDir = path.join(process.cwd(), 'public', 'landing-page');

    const heroImageAtt = await seedAttachment(Attachment, {
      srcPath: path.join(publicLPDir, '1050x600.svg'),
      destSubDir: 'landing-page',
      fileName: '1050x600.svg',
      mimeType: 'image/svg+xml',
      fileType: 'image',
    });

    const featuresImageAtt = await seedAttachment(Attachment, {
      srcPath: path.join(publicLPDir, '520x410.svg'),
      destSubDir: 'landing-page',
      fileName: '520x410.svg',
      mimeType: 'image/svg+xml',
      fileType: 'image',
    });

    const socialImageAtt = await seedAttachment(Attachment, {
      srcPath: path.join(publicLPDir, '340x600.svg'),
      destSubDir: 'landing-page',
      fileName: '340x600.svg',
      mimeType: 'image/svg+xml',
      fileType: 'image',
    });

    const [plans, faqs, testimonials, blogs] = await Promise.all([
      Plan.find({ status: 'active' }).select('_id').lean(),
      Faq.find({ status: true }).select('_id').lean(),
      Testimonial.find({ status: true }).select('_id').lean(),
      Blog.find({ status: true }).select('_id').lean().limit(3),
    ]);

    const seedData = {
      hero: {
        badge: 'Next-Gen AI Platform',
        heading: 'Create Viral AI Videos and Reels in Minutes',
        subheading: 'The all-in-one AI platform to create stunning images, videos, and social media content — in seconds.',
        cta_primary_text: 'Get Started Now',
        cta_secondary_text: 'Explore Features',
        dashboard_image_id: heroImageAtt ? heroImageAtt._id : null,
      },

      features: {
        section_badge: 'Powerful Capabilities',
        section_heading: 'Everything You Need to Create Content',
        section_subheading: 'The all-in-one AI platform to create stunning images, videos, and social media content — in seconds.',
        items: [
          {
            title: 'Text to Image',
            description: 'Transform your words into stunning, high-resolution visuals instantly using state-of-the-art AI models.',
            image_id: featuresImageAtt ? featuresImageAtt._id : null,
            color: 'text-blue-400',
          },
          {
            title: 'Image to Image',
            description: 'Engage with our intelligent AI that understands context and provides accurate, human-like responses.',
            image_id: featuresImageAtt ? featuresImageAtt._id : null,
            color: 'text-purple-400',
          },
          {
            title: 'Text to Video',
            description: 'Create cinematic, high-quality videos from simple text prompts in just a few clicks.',
            image_id: featuresImageAtt ? featuresImageAtt._id : null,
            color: 'text-pink-400',
          },
          {
            title: 'Image to Video',
            description: 'Bring your still images to life — animate photos and artwork into fluid, high-quality video clips with AI.',
            image_id: featuresImageAtt ? featuresImageAtt._id : null,
            color: 'text-cyan-400',
          },
          {
            title: 'Video Motion',
            description: 'Add dynamic motion effects, transitions, and cinematic camera moves to any video with a single prompt.',
            image_id: featuresImageAtt ? featuresImageAtt._id : null,
            color: 'text-emerald-400',
          },
          {
            title: 'Character Generation',
            description: 'Create consistent, high-quality characters for videos, ads, and animations with simple text prompts.',
            image_id: featuresImageAtt ? featuresImageAtt._id : null,
            color: 'text-emerald-400',
          },
          {
            title: 'Ecommerce Catalogue',
            description: 'Generate complete product catalogues with lifestyle shots, variations, and marketing copy in one click.',
            image_id: featuresImageAtt ? featuresImageAtt._id : null,
            color: 'text-emerald-400',
          },
        ],
      },

      social: {
        platforms: [
          {
            platform_id: 'instagram',
            name: 'Instagram',
            badge: 'Instagram Excellence',
            title: 'Master Your',
            highlight: 'Instagram Presence',
            description: 'Create aesthetic posts, viral reels, and engaging stories with AI-powered visuals and captions tailored for Instagram.',
            image_id: socialImageAtt ? socialImageAtt._id : null,
            features: [
              { icon: 'ImageIcon', title: 'Aesthetic Posts', description: 'Generate visually stunning post concepts and captions.', image_id: socialImageAtt ? socialImageAtt._id : null },
              { icon: 'Sparkles', title: 'Viral Reels', description: 'AI-powered scripts for high-engagement short-form video.', image_id: socialImageAtt ? socialImageAtt._id : null },
              { icon: 'Layout', title: 'Story Magic', description: 'Interactive story ideas that keep your followers engaged.', image_id: socialImageAtt ? socialImageAtt._id : null },
            ],
          },
          {
            platform_id: 'facebook',
            name: 'Facebook',
            badge: 'Facebook Mastery',
            title: 'Grow Your',
            highlight: 'Facebook Community',
            description:
              'Boost engagement with community-focused posts, viral video scripts, and optimized ad copy for Facebook.',
            image_id: socialImageAtt ? socialImageAtt._id : null,
            features: [
              {
                icon: 'MessageSquare',
                title: 'Community Engagement',
                description:
                  'Posts designed to spark conversations and shares.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'Sparkles',
                title: 'Video Scripts',
                description:
                  'Compelling scripts for Facebook Watch and long-form video.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'Layout',
                title: 'Ad Optimization',
                description:
                  'High-converting ad copy that drives real business results.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
            ],
          },
          {
            platform_id: 'linkedin',
            name: 'LinkedIn',
            badge: 'LinkedIn Authority',
            title: 'Build Your',
            highlight: 'Professional Brand',
            description:
              'Publish thought-leadership posts, network updates, and industry insights designed to grow your professional influence.',
            image_id: socialImageAtt ? socialImageAtt._id : null,
            features: [
              {
                icon: 'FileText',
                title: 'Thought Leadership',
                description:
                  'Write engaging professional posts and articles.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'Users',
                title: 'B2B Networking',
                description:
                  'Grow your network with business-focused content.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'Shield',
                title: 'Brand Authority',
                description:
                  'Establish credibility in your industry.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
            ],
          },
          {
            platform_id: 'twitter',
            name: 'Twitter',
            badge: 'Twitter Impact',
            title: 'Grow Your',
            highlight: 'Twitter Audience',
            description:
              'Write engaging tweets, build viral threads, and schedule updates to boost your presence and network on Twitter.',
            image_id: socialImageAtt ? socialImageAtt._id : null,
            features: [
              {
                icon: 'Sparkles',
                title: 'Viral Tweets',
                description:
                  'AI-generated tweets optimized for high engagement and retweets.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'FileText',
                title: 'Thread Builder',
                description:
                  'Create logical, interesting threads that tell a story.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'Users',
                title: 'Audience Building',
                description:
                  'Strategies and posts that convert views into active followers.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
            ],
          },
          {
            platform_id: 'youtube',
            name: 'YouTube',
            badge: 'YouTube Growth',
            title: 'Grow Your',
            highlight: 'YouTube Channel',
            description:
              'Draft video scripts, optimize descriptions, create catchy titles, and design YouTube Shorts to maximize watch time.',
            image_id: socialImageAtt ? socialImageAtt._id : null,
            features: [
              {
                icon: 'FileText',
                title: 'Video Scripts',
                description:
                  'Well-structured outlines and full video scripts.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'Sparkles',
                title: 'YouTube Shorts',
                description:
                  'Catchy concepts for YouTube Shorts.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
              {
                icon: 'Layout',
                title: 'SEO Titles & Tags',
                description:
                  'Titles and descriptions optimized for search.',
                image_id: socialImageAtt ? socialImageAtt._id : null,
              },
            ],
          },
          {
            platform_id: 'threads',
            name: 'Threads',
            badge: 'Threads Excellence',
            title: 'Master Your',
            highlight: 'Threads Presence',
            description: 'Write engaging threads, share photo-carousel updates, and grow your presence on Meta\'s Threads app.',
            image_id: socialImageAtt ? socialImageAtt._id : null,
            features: [
              { icon: 'MessageSquare', title: 'Engaging Threads', description: 'Create textual threads that spark conversations.', image_id: socialImageAtt ? socialImageAtt._id : null },
              { icon: 'Sparkles', title: 'Aesthetic Media', description: 'Post stunning carousel photos or video updates.', image_id: socialImageAtt ? socialImageAtt._id : null },
              { icon: 'Layout', title: 'Audience growth', description: 'Cross-sharing features to maximize organic reach.', image_id: socialImageAtt ? socialImageAtt._id : null },
            ],
          },
        ],
      },

      stats: {
        items: [
          { val: '500+', label: 'Happy Creators' },
          { val: '4.9/5', label: 'Store Rating' },
          { val: '12+', label: 'Posts Published' },
          { val: '24/7', label: 'AI Support' },
        ],
      },

      pricing: {
        badge: 'Pricing',
        title: 'Simple, Transparent Pricing',
        description: 'Choose the plan that fits your needs. No hidden fees, cancel anytime.',
        plan_ids: plans.map(p => p._id),
      },

      blog: {
        badge: 'Latest Insights',
        title: 'From Our Blog',
        description: 'Stay up to date with the latest AI trends, tutorials and product updates.',
        blog_ids: blogs.map(b => b._id),
      },

      testimonials: {
        section_badge: 'Wall of Love',
        section_heading: 'Trusted by 100K+ Creators Worldwide',
        section_subheading: 'Join thousands of creators who are already using Reelease AI to supercharge their content.',
        testimonial_ids: testimonials.map(t => t._id),
      },

      faq: {
        section_badge: 'Common Questions',
        section_heading: 'Frequently Asked Questions',
        section_subheading: "Everything you need to know about Reelease AI. Can't find the answer you're looking for? Contact our team.",
        faq_ids: faqs.map(f => f._id),
      },

      contact: {
        section_badge: 'Get In Touch',
        heading: 'Have Questions? We Have Answers',
        subheading: 'Our support team is available around the clock to help you with anything you need.',
        email: 'hello@reelease.ai',
        phone: null,
        address: null,
        live_chat_label: 'Available 24/7',
      },

      footer: {
        tagline: 'The AI-powered platform for creators and businesses to build, publish and grow.',
        copyright: '© 2024 Reelease AI. All Rights Reserved.',
        address: '123 AI Street, Tech City, TC 12345',
        phone: '+1 (234) 567-890',
        email: 'support@reelease.ai',
        social_links: [
          { name: 'Facebook', href: 'https://www.facebook.com', icon: 'Facebook' },
          { name: 'Twitter', href: 'https://twitter.com', icon: 'Twitter' },
          { name: 'Instagram', href: 'https://www.instagram.com', icon: 'Instagram' },
          { name: 'LinkedIn', href: 'https://www.linkedin.com', icon: 'Linkedin' },
          { name: 'Youtube', href: 'https://www.youtube.com', icon: 'Youtube' },
          { name: 'Threads', href: 'https://www.threads.com', icon: 'ThreadsIcon' },
        ],
      },
    };

    const existing = await LandingPageModel.findOne();

    if (existing) {
      let patched = false;

      if (!existing.hero.dashboard_image_id && heroImageAtt) {
        existing.hero.dashboard_image_id = heroImageAtt._id;
        patched = true;
      }

      if (existing.features && existing.features.items) {
        existing.features.items.forEach(item => {
          if (!item.image_id && featuresImageAtt) {
            item.image_id = featuresImageAtt._id;
            patched = true;
          }
        });
        if (patched) existing.markModified('features.items');
      }

      if (existing.social && existing.social.platforms) {
        const hasThreads = existing.social.platforms.some(p => p.platform_id === 'threads');
        if (!hasThreads) {
          const threadsPlatform = seedData.social.platforms.find(p => p.platform_id === 'threads');
          if (threadsPlatform) {
            existing.social.platforms.push(threadsPlatform);
            patched = true;
          }
        }

        existing.social.platforms.forEach(platform => {
          if (!platform.image_id && socialImageAtt) {
            platform.image_id = socialImageAtt._id;
            patched = true;
          }
          if (platform.features) {
            platform.features.forEach(feature => {
              if (!feature.image_id && socialImageAtt) {
                feature.image_id = socialImageAtt._id;
                patched = true;
              }
            });
          }
        });
        if (patched) existing.markModified('social.platforms');
      }

      if (existing.footer && existing.footer.social_links) {
        const hasThreadsLink = existing.footer.social_links.some(link => link.name === 'Threads');
        if (!hasThreadsLink) {
          existing.footer.social_links.push({ name: 'Threads', href: '#', icon: 'ThreadsIcon' });
          patched = true;
          existing.markModified('footer.social_links');
        }
      }

      if (patched) {
        await existing.save();
      }
      return;
    }

    const landingPage = new LandingPageModel(seedData);
    await landingPage.save();

    console.log('\n✅ Landing page seeded successfully!');
  } catch (error) {
    console.error('Error seeding landing page:', error);
    throw error;
  }
}

async function down({ db: dbModels }) {
  try {
    const LandingPageModel = dbModels.LandingPage || LandingPage;
    const Attachment = dbModels.Attachment || require('../models/attachment.model');

    await LandingPageModel.deleteMany({});

    const landingPagePaths = [
      '/uploads/landing-page/1050x600.svg',
      '/uploads/landing-page/520x410.svg',
      '/uploads/landing-page/340x600.svg',
    ];
    await Attachment.deleteMany({ file_path: { $in: landingPagePaths } });

    const logoPaths = [
      '/uploads/logos/dark_logo.png',
      '/uploads/logos/favicon.png',
      '/uploads/logos/onboarding_logo.png',
      '/uploads/logos/sidebar_logo.png',
    ];
    await Attachment.deleteMany({ file_path: { $in: logoPaths } });
  } catch (error) {
    console.error('Error removing landing page seed:', error);
    throw error;
  }
}

module.exports = { up, down };
