const Caption = require('../models/caption.model');

exports.getCaptions = async (req, res) => {
  try {
    const { search, source, status, page = 1, limit = 10 } = req.query;
    const query = { user_id: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    if (source && source !== 'all') {
      query.source = source.toLowerCase();
    }

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    const captions = await Caption.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Caption.countDocuments(query);

    res.json({
      captions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCaptionById = async (req, res) => {
  try {
    const caption = await Caption.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!caption) {
      return res.status(404).json({ message: 'Caption not found' });
    }
    res.json(caption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCaption = async (req, res) => {
  try {
    const { name, source, status, content, tags, notes } = req.body;
    
    const caption = new Caption({
      user_id: req.user._id,
      name,
      source: source || 'manual',
      status: status || 'active',
      content,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      notes
    });

    await caption.save();
    res.status(201).json(caption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCaption = async (req, res) => {
  try {
    const { name, source, status, content, tags, notes } = req.body;
    
    const caption = await Caption.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      {
        name,
        source,
        status,
        content,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
        notes
      },
      { new: true, runValidators: true }
    );

    if (!caption) {
      return res.status(404).json({ message: 'Caption not found' });
    }

    res.json(caption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCaption = async (req, res) => {
  try {
    const caption = await Caption.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!caption) {
      return res.status(404).json({ message: 'Caption not found' });
    }
    res.json({ message: 'Caption deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
