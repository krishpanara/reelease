'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const session = require('express-session');
const connectDB = require('./config/db');
const { getWatermarkedBuffer } = require('./utils/watermark-helper');
const { db } = require('./models');
const Setting = require('./models/setting.model');
const User = require('./models/user.model');
const { initAITaskCron } = require('./cron/ai-task.cron');
require('./cron/checkExpiredSubscriptions');
const { initScheduledPostsCron } = require('./cron/scheduled-posts.cron');
const { initTopUpExpiryCron } = require('./cron/topup-expiry.cron');
const helmet = require('helmet');
const app = express();
dotenv.config();
const { rtInit } = require('./node/src/middlewares/runtime-init.js');

const { denyMutationInDemo } = require('./middlewares/demo-mode');

app.set('trust proxy', true);

// Collapse duplicate slashes in the path (e.g. STORAGE_URL + '/' + '/uploads/x.png' -> '//uploads/x.png')
// so media URLs built on the frontend still resolve to the static uploads folder.
app.use((req, res, next) => {
  const q = req.url.indexOf('?');
  const pathname = q === -1 ? req.url : req.url.slice(0, q);
  if (pathname.includes('//')) {
    req.url = pathname.replace(/\/{2,}/g, '/') + (q === -1 ? '' : req.url.slice(q));
  }
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'reelease-ai-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: false,
}));

connectDB().then(() => {
  console.log('Database connected.');
});

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

      if (!origin || origin === 'null') return callback(null, true);

      if (origin && (origin.includes('localhost:') || origin.includes('127.0.0.1:'))) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked: ' + origin));
      }
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook/stripe') {
    next();
  } else {
    express.json({ limit: '5mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.get('/uploads/*', async (req, res, next) => {
  const filePath = path.join(__dirname, req.path);
  if (!fs.existsSync(filePath)) return next();

  const ext = path.extname(filePath).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

  if (!isImage) return next();

  try {
    const { Attachment } = db;
    let isGenerated = false;
    let createdBy = null;

    const relativePath = req.path.replace(/^\//, '').replace(/\\/g, '/');
    const attachment = await Attachment.findOne({
      $or: [
        { file_path: relativePath },
        { file_path: relativePath.replace('uploads/', '') },
        // Paths saved on Windows use backslashes (multer's file.path)
        { file_path: relativePath.split('/').join('\\') },
      ],
    });

    if (attachment) {
      if (attachment.is_generated) isGenerated = true;
      createdBy = attachment.created_by;
    } else if (req.path.startsWith('/uploads/ai/')) {
      return next();
    }

    if (isGenerated && createdBy) {
      const buffer = await getWatermarkedBuffer(filePath, createdBy, null);
      if (buffer) {
        res.set('Content-Type', 'image/' + (ext === '.jpg' ? 'jpeg' : ext.substring(1)));
        return res.send(buffer);
      }
    }
  } catch (error) {
    console.error('Dynamic watermark error:', error);
  }

  next();
});

app.use(rtInit);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/install', express.static(path.join(__dirname, 'public/install')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { initializeInstaller, createInstallationMiddleware } = require('./lib/install');
try {
  initializeInstaller(app);
  console.log('Installer initialized');
} catch (err) {
  console.error('Failed to initialize installer:', err);
}

app.use(createInstallationMiddleware());

initAITaskCron(app);
initScheduledPostsCron(app);
initTopUpExpiryCron();

app.use('/api', denyMutationInDemo);
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const faqRoutes = require('./routes/faq.routes');
const inquiryRoutes = require('./routes/contact-inquiries.routes');
const settingRoutes = require('./routes/setting.routes');
const pageRoutes = require('./routes/page.routes');
const roleRoutes = require('./routes/role.routes');
const languageRoutes = require('./routes/language.routes');
const attachmentRoutes = require('./routes/attachment.routes');
const categoryRoutes = require('./routes/category.routes');
const tagRoutes = require('./routes/tag.routes');
const blogRoutes = require('./routes/blog.routes');
const emailTemplateRoutes = require('./routes/email-template.routes');
const planRoutes = require('./routes/plan.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const webhookRoutes = require('./routes/webhook.routes');
const paymentGatewayConfigRoutes = require('./routes/payment-gateway-config.routes');
const socialRoutes = require('./routes/social.routes');
const socialPublishRoutes = require('./routes/social-publish.routes');
const userSettingsRoutes = require('./routes/user-settings.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const notificationRoutes = require('./routes/notification.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const landingPageRoutes = require('./routes/landing-page.routes');
const aiProviderRoutes = require('./routes/ai-provider.routes');
const aiFeatureCreditRoutes = require('./routes/ai-feature-credit.routes');
const aiTemplateCategoryRoutes = require('./routes/ai-template-category.routes');
const aiTemplateRoutes = require('./routes/ai-template.routes');
const aiPromptRoutes = require('./routes/ai-prompt.routes');
const aiRoutes = require('./routes/ai.routes');
const aiCaptionModelRoutes = require('./routes/ai-caption-model.routes');
const characterRoutes = require('./routes/character.routes');
const ecommerceCatalogueRoutes = require("./routes/ecommerce-catalogue.routes");
const captionRoutes = require('./routes/caption.routes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/setting', settingRoutes);
app.use('/api/page', pageRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/attachment', attachmentRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/tag', tagRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/email-template', emailTemplateRoutes);
app.use('/api/ai-provider', aiProviderRoutes);
app.use('/api/ai-feature-credit', aiFeatureCreditRoutes);
app.use('/api/ai-template-category', aiTemplateCategoryRoutes);
app.use('/api/ai-template', aiTemplateRoutes);
app.use('/api/ai-prompt', aiPromptRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-caption-models', aiCaptionModelRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payment-gateway-config', paymentGatewayConfigRoutes);

app.use('/api/webhook', webhookRoutes);

app.use('/api/social', socialRoutes);
app.use('/api/social/publish', socialPublishRoutes);

app.use('/api/user-setting', userSettingsRoutes);
app.use('/api/testimonial', testimonialRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/landing-page', landingPageRoutes);
app.use('/api/caption', captionRoutes);
app.use("/api/ecommerce-catalogue", ecommerceCatalogueRoutes);


app.get('/api/demo', async (req, res) => {
  const settings = await Setting.findOne().select('demo_user_email demo_user_password').lean();
  const isDemo = process.env.APP_DEMO_MODE === 'true';
  if (!isDemo) {
    return res.json({ demo: false });
  }

  try {
    const adminUser = await User.findOne({ role: { $in: ['super_admin', 'admin'] } }).select('email').lean();

    return res.json({
      demo: true,
      admin: {
        email: adminUser?.email || process.env.ADMIN_EMAIL || '',
        password: process.env.ADMIN_PASSWORD || '',
      },
      user: {
        email: settings?.demo_user_email || '',
        password: settings?.demo_user_password || '',
      },
    });
  } catch (err) {
    console.error('Demo endpoint error:', err);
    return res.json({
      demo: true,
      admin: {
        email: process.env.ADMIN_EMAIL || '',
        password: process.env.ADMIN_PASSWORD || '',
      },
      user: {
        email: '',
        password: '',
      },
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: 'The requested resource was not found',
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
