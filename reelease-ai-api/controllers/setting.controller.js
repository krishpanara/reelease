const { db } = require('../models');
const Setting = db.Setting;
const Language = db.Language;
const fs = require('fs');
const path = require('path');
const { sendTemplateMail } = require('../utils/mail');

const updateEnvFile = (settings) => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');

      const updateOrAdd = (key, value) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const val = value === null || value === undefined ? '' : value;
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${val}`);
        } else {
          envContent += `\n${key}=${val}`;
        }
      };

      updateOrAdd('SMTP_HOST', settings.smtp_host);
      updateOrAdd('SMTP_PORT', settings.smtp_port);
      updateOrAdd('SMTP_USER', settings.smtp_user);
      updateOrAdd('SMTP_PASS', settings.smtp_pass);
      updateOrAdd('MAIL_FROM_NAME', settings.mail_from_name);
      updateOrAdd('MAIL_FROM_ADDRESS', settings.mail_from_email);
      updateOrAdd('MAIL_ENCRYPTION', settings.mail_encryption);

      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    }
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne().lean();

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found.' });
    }

    const userIp = req.ip?.replace(/^::ffff:/, '') || req.headers['x-forwarded-for']?.split(',')[0].trim();

    res.status(200).json({
      message: 'Settings fetched successfully',
      settings: {
        id: settings._id,
        userIp,
        ...settings
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne().lean({ virtuals: true });
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    const updateData = {};

    const basicFields = ['app_name', 'app_description', 'app_email', 'support_email', 'default_language', 'registration_free_credits', 'registration_free_caption_credits'];
    const emailFields = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'mail_from_name', 'mail_from_email', 'mail_encryption', 'otp_message'];
    const maintenanceFields = ['maintenance_mode', 'maintenance_title', 'maintenance_message', 'maintenance_image_url', 'maintenance_allowed_ips'];
    const logoFields = [
      'favicon_url', 'logo_light_url', 'logo_dark_url', 'sidebar_logo_url', 'sidebar_light_logo_url', 'mobile_logo_url',
      'favicon_notification_logo_url'
    ];
    const pageFields = ['page_404_title', 'page_404_content', 'page_404_image_url', 'no_internet_title', 'no_internet_content', 'no_internet_image_url'];
    const chatFields = [
      'document_file_limit', 'audio_file_limit', 'video_file_limit', 'image_file_limit', 'multiple_file_share_limit',
      'maximum_message_length', 'allowed_file_upload_types', 'session_expiration_days'
    ];
    const watermarkFields = [
      'watermark_enabled', 'watermark_type', 'watermark_text', 'watermark_image_url', 'watermark_position',
      'watermark_opacity', 'watermark_scale', 'watermark_rotation', 'watermark_font', 'watermark_font_weight',
      'watermark_italic', 'watermark_underline',
      'watermark_style', 'watermark_color', 'watermark_blend_mode', 'watermark_tiling', 'watermark_padding'
    ];

    const sessionFields = [];
    const extendedFields = [];
    const socialFields = [
      'facebook_app_id', 'facebook_app_secret', 'facebook_api_version',
      'threads_app_id', 'threads_app_secret',
      'linkedin_client_id', 'linkedin_client_secret',
      'twitter_consumer_key', 'twitter_consumer_secret',
      'twitter_oauth_token', 'twitter_oauth_token_secret',
      'twitter_client_id', 'twitter_client_secret',
      'youtube_client_id', 'youtube_client_secret'
    ];

    const allFields = [...basicFields, ...logoFields, ...maintenanceFields, ...pageFields, ...emailFields,
    ...chatFields, ...sessionFields, ...extendedFields, ...watermarkFields, ...socialFields,
      'demo_user_email', 'demo_user_password'
    ];

    const fieldMap = {
      favicon: 'favicon_url',
      logo_light: 'logo_light_url',
      logo_dark: 'logo_dark_url',
      sidebar_logo: 'sidebar_logo_url',
      sidebar_light_logo: 'sidebar_light_logo_url',
      mobile_logo: 'mobile_logo_url',
      favicon_notification_logo: 'favicon_notification_logo_url',
      maintenance_image: 'maintenance_image_url',
      page_404_image: 'page_404_image_url',
      no_internet_image: 'no_internet_image_url',
      watermark_image: 'watermark_image_url',
    };

    allFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'maintenance_allowed_ips' || field === 'allowed_file_upload_types') {
          try {
            updateData[field] = Array.isArray(req.body[field]) ? req.body[field] : JSON.parse(req.body[field] || '[]');
          } catch {
            updateData[field] = [];
          }
        } else {
          let val = req.body[field];
          if (typeof val === 'string') {
            val = val.trim();
          }
          updateData[field] = val;
        }
      }
    });

    Object.keys(fieldMap).forEach((uploadField) => {
      if (req.body[uploadField] === 'null' || req.body[uploadField] === null) {
        const dbField = fieldMap[uploadField];
        if (settings[dbField]) {
          const oldPath = path.join(process.cwd(), settings[dbField]);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error deleting file:', e); }
          }
        }
        updateData[dbField] = null;
      }
    });

    if (req.files) {
      Object.keys(req.files).forEach((uploadField) => {
        const file = req.files[uploadField][0];
        const dbField = fieldMap[uploadField];
        if (file && dbField) {
          if (settings[dbField]) {
            const oldPath = path.join(process.cwd(), settings[dbField]);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[dbField] = file.path;
        }
      });
    }

    const numericFields = [
      'document_file_limit', 'audio_file_limit', 'video_file_limit', 'image_file_limit', 'multiple_file_share_limit',
      'maximum_message_length', 'session_expiration_days', 'registration_free_credits', 'registration_free_caption_credits',
      'watermark_opacity', 'watermark_scale', 'watermark_rotation', 'watermark_padding'
    ];

    if (updateData.default_language !== undefined) {
      const selectedLanguage = await Language.findOne({ locale: updateData.default_language, }).lean();
      if (!selectedLanguage) {
        return res.status(400).json({ message: `Language with code '${updateData.default_language}' not found`, });
      }

      if (selectedLanguage.is_active === false) {
        return res.status(400).json({ message: `Deactivated language '${selectedLanguage.name || selectedLanguage.locale}' cannot be set as default language`, });
      }
    }

    numericFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field] === '' || updateData[field] == null ? null : Number(updateData[field]);
      }
    });

    if (updateData.maintenance_mode !== undefined) {
      updateData.maintenance_mode = updateData.maintenance_mode === 'true' || updateData.maintenance_mode === true || updateData.maintenance_mode === '1' || updateData.maintenance_mode === 1;
    }

    if (updateData.watermark_enabled !== undefined) {
      updateData.watermark_enabled = updateData.watermark_enabled === 'true' || updateData.watermark_enabled === true || updateData.watermark_enabled === '1' || updateData.watermark_enabled === 1;
    }

    if (updateData.watermark_tiling !== undefined) {
      updateData.watermark_tiling = updateData.watermark_tiling === 'true' || updateData.watermark_tiling === true || updateData.watermark_tiling === '1' || updateData.watermark_tiling === 1;
    }

    if (updateData.watermark_italic !== undefined) {
      updateData.watermark_italic = updateData.watermark_italic === 'true' || updateData.watermark_italic === true || updateData.watermark_italic === '1' || updateData.watermark_italic === 1;
    }

    if (updateData.watermark_underline !== undefined) {
      updateData.watermark_underline = updateData.watermark_underline === 'true' || updateData.watermark_underline === true || updateData.watermark_underline === '1' || updateData.watermark_underline === 1;
    }

    if (updateData.smtp_port !== undefined && (updateData.smtp_port < 1 || updateData.smtp_port > 65535)) {
      return res.status(400).json({ message: 'SMTP port must be between 1 and 65535' });
    }

    if (updateData.maximum_message_length !== undefined && (updateData.maximum_message_length < 1 || updateData.maximum_message_length > 50000)) {
      return res.status(400).json({ message: 'Message length must be between 1 and 50000' });
    }
    await Setting.updateOne({}, { $set: updateData }, { upsert: true });

    const updatedSettings = await Setting.findOne().lean({ virtuals: true });

    updateEnvFile(updatedSettings);

    const { smtp_pass, _id, ...safeSettings } = updatedSettings || {};

    safeSettings.id = updatedSettings.id || updatedSettings._id?.toString();

    const io = req.app.get('io');
    io.emit('admin-settings-updated', safeSettings);

    return res.status(200).json({ message: 'Settings updated successfully', settings: safeSettings, });
  } catch (err) {
    console.error('Error updating settings:', err);

    if (req.files) {
      Object.values(req.files).flat().forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.sendTestMail = async (req, res) => {
  const { to } = req.body;

  if (!to) return res.status(400).json({ message: 'To is required field.' });

  try {
    const settings = await Setting.findOne();
    const siteName = settings.app_name || 'My App';
    const timestamp = new Date().toLocaleString();

    const result = await sendTemplateMail(
      to,
      'Test Email Verification',
      'test-email',
      { siteName, timestamp }
    );

    if (result.success) {
      return res.status(200).json({ message: 'Test email sent successfully!' });
    } else {
      return res.status(500).json({ message: result.message, error: result.message });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ message: 'Error sending test email.' });
  }
};

exports.getPublicSettings = async (req, res) => {
  try {
    const publicFields = [
      'app_name',
      'app_description',
      'logo_dark_url',
      'logo_light_url',
      'mobile_logo_url',
      'no_internet_image_url',
      'page_404_image_url',
      'page_404_content',
      'page_404_title',
      'sidebar_logo_url',
      'sidebar_light_logo_url',
      'default_language',
      'favicon_notification_logo_url',
      'favicon_url',
      'maintenance_image_url',
      'maintenance_message',
      'maintenance_mode',
      'maintenance_title',
      'maintenance_allowed_ips',
      'no_internet_title',
      'no_internet_content',
      'otp_message',
      'document_file_limit',
      'audio_file_limit',
      'video_file_limit',
      'image_file_limit',
      'multiple_file_share_limit',
      'watermark_enabled',
      'watermark_type',
      'watermark_text',
      'watermark_image_url',
      'watermark_position',
      'watermark_opacity',
      'watermark_scale',
      'watermark_rotation',
      'watermark_font',
      'watermark_font_weight',
      'watermark_italic',
      'watermark_underline',
      'watermark_style',
      'watermark_color',
      'watermark_blend_mode',
      'watermark_tiling',
      'watermark_padding',
      'facebook_app_id',
      'facebook_api_version',
      'linkedin_client_id',
      'twitter_client_id',
      'youtube_client_id'
    ];

    const settings = await Setting.findOne().select(publicFields.join(' ')).lean();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found.' });
    }

    const userIp = req.ip?.replace(/^::ffff:/, '') || req.headers['x-forwarded-for']?.split(',')[0].trim();

    res.status(200).json({
      message: 'Public settings fetched successfully',
      settings: {
        id: settings._id,
        userIp,
        ...settings
      }
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};