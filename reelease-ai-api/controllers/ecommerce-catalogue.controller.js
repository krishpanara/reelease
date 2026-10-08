const { db } = require('../models');
const AITask = db.AITask;
const aiController = require("./ai.controller");

exports.generateCatalogueVideo = async (req, res) => {
  try {
    const { character, product, prompt } = req.body;

    if (!character || !product || !prompt) {
      return res.status(400).json({ message: 'Character, product, and prompt are required.' });
    }

    req.body.serviceType = 'images_to_video';
    req.body.overrideServiceType = 'ecommerce_catalogue';
    req.body.overrideCreditCost = 15;

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    const resolveUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      return `${cleanBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    req.body.referenceUrls = [
      resolveUrl(character.image_url),
      resolveUrl(product.image_url),
    ].filter(Boolean);

    req.body.extraPayload = {
      character,
      product,
      prompt,
    };

    return await aiController.generateMedia(req, res);
  } catch (error) {
    console.error('generateCatalogueVideo error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong.' });
  }
};

exports.getCatalogueVideos = async (req, res) => {
  try {
    const tasks = await AITask.find({
      user_id: req.user._id,
      service_type: 'ecommerce_catalogue',
    }).sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('getCatalogueVideos error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong.' });
  }
};

exports.deleteCatalogueVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await AITask.findOneAndDelete({
      _id: id,
      user_id: req.user._id,
      service_type: 'ecommerce_catalogue',
    });

    if (!task) {
      return res.status(404).json({ message: 'Catalogue video not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Catalogue video deleted successfully.',
    });
  } catch (error) {
    console.error('deleteCatalogueVideo error:', error);
    return res.status(500).json({ message: error.message || 'Something went wrong.' });
  }
};
