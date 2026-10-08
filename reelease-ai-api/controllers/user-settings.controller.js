const { db } = require('../models');
const Setting = db.Setting;

const path = require('path');
const fs = require('fs');

exports.updateUserSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    let userSettings = await db.UserSettings.findOne({ user: userId });
    if (!userSettings) {
      userSettings = new db.UserSettings({ user: userId });
    }

    const watermarkFields = [
      'watermark_enabled', 'watermark_type', 'watermark_text', 'watermark_image_url', 'watermark_position',
      'watermark_opacity', 'watermark_scale', 'watermark_rotation', 'watermark_font', 'watermark_font_weight',
      'watermark_italic', 'watermark_underline',
      'watermark_style', 'watermark_color', 'watermark_blend_mode', 'watermark_tiling', 'watermark_padding'
    ];

    watermarkFields.forEach(field => {
      if (req.body[field] !== undefined) {
        userSettings[field] = req.body[field];
      }
    });

    if (req.files && req.files.watermark_image) {
      const file = req.files.watermark_image;
      const uploadPath = `uploads/watermarks/user-${userId}-${Date.now()}-${file.name}`;
      const absolutePath = path.join(__dirname, '..', uploadPath);
      
      const dir = path.dirname(absolutePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      await file.mv(absolutePath);
      userSettings.watermark_image_url = '/' + uploadPath;
    } else if (req.body.watermark_image_url !== undefined) {
      userSettings.watermark_image_url = req.body.watermark_image_url;
    }

    await userSettings.save();

    res.status(200).json({
      success: true,
      message: 'User settings updated successfully.',
      userSettings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Failed to update user settings' });
  }
};

exports.getUserSetting = async (req, res) => {
  try {
    const settings = await Setting.findOne().lean();
    
    const userId = req.user.id;
    let userSettings = await db.UserSettings.findOne({ user: userId });
    if (!userSettings) {
      userSettings = new db.UserSettings({ user: userId });
      await userSettings.save();
    }

    const publicData = settings ? {
      facebook_app_id: settings.facebook_app_id || null,
      facebook_api_version: settings.facebook_api_version || 'v18.0',
      linkedin_client_id: settings.linkedin_client_id || '',
      twitter_client_id: settings.twitter_client_id || '',
    } : null;

    res.status(200).json({ 
      success: true, 
      data: publicData,
      userSettings: userSettings
    });
  } catch (error) {
    console.error('Error getting user setting:', error);
    res.status(500).json({ message: 'Failed to get user setting' });
  }
};
