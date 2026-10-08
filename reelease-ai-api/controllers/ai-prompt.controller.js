const { db } = require('../models');
const AIPrompt = db.AIPrompt;

exports.createPrompt = async (req, res) => {
  try {
    const { category, prompt } = req.body;

    if (!category || !prompt) {
      return res.status(400).json({ message: 'Category and prompt are required.' });
    }

    const aiPrompt = new AIPrompt({ category, prompt });
    await aiPrompt.save();

    res.status(201).json({
      message: 'AI Prompt created successfully.',
      prompt: aiPrompt
    });
  } catch (error) {
    console.error('Create AI Prompt error:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');

      return res.status(400).json({ message });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'This prompt already exists in the selected category.' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPrompts = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category } = req.query;
    const query = {};

    if (search) {
      query.prompt = { $regex: search, $options: 'i' };
    }

    if (category) query.category = category;

    const prompts = await AIPrompt.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AIPrompt.countDocuments(query);

    res.status(200).json({
      prompts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get AI Prompts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await AIPrompt.distinct('category');
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Get AI Prompt Categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPromptById = async (req, res) => {
  try {
    const prompt = await AIPrompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }
    res.status(200).json(prompt);
  } catch (error) {
    console.error('Get AI Prompt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePrompt = async (req, res) => {
  try {
    const { category, prompt } = req.body;
    const aiPrompt = await AIPrompt.findById(req.params.id);

    if (!aiPrompt) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    if (category) aiPrompt.category = category;
    if (prompt !== undefined) aiPrompt.prompt = prompt;

    await aiPrompt.save();

    res.status(200).json({
      message: 'AI Prompt updated successfully.',
      prompt: aiPrompt
    });
  } catch (error) {
    console.error('Update AI Prompt error:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');

      return res.status(400).json({ message });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'This prompt already exists in the selected category.' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePrompt = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of IDs.' });
    }

    const result = await AIPrompt.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: 'Prompts deleted successfully.',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete AI Prompts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};