const { db } = require('../models');
const AIFeatureCredit = db.AIFeatureCredit;

exports.getCreditsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const credits = await AIFeatureCredit.find({ provider_id: providerId });
    
    res.status(200).json({
      message: 'Credits fetched successfully.',
      credits
    });
  } catch (error) {
    console.error('Get Credits error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const credit = await AIFeatureCredit.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!credit) {
      return res.status(404).json({ message: 'Credit setting not found.' });
    }

    res.status(200).json({
      message: 'Credit setting updated successfully.',
      credit
    });
  } catch (error) {
    console.error('Update Credit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.upsertCredit = async (req, res) => {
  try {
    const { provider_id, feature_key, ...rest } = req.body;

    if (!provider_id || !feature_key) {
      return res.status(400).json({ message: 'provider_id and feature_key are required.' });
    }

    const credit = await AIFeatureCredit.findOneAndUpdate(
      { provider_id, feature_key },
      { $set: { ...rest, provider_id, feature_key } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Credit setting saved successfully.',
      credit
    });
  } catch (error) {
    console.error('Upsert Credit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const credit = await AIFeatureCredit.findByIdAndDelete(id);

    if (!credit) {
      return res.status(404).json({ message: 'Credit setting not found.' });
    }

    res.status(200).json({
      message: 'Credit setting deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Credit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
