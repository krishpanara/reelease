const Tag = require('../models/tag.model');

exports.create = async (req, res) => {
  try {
    const tag = new Tag(req.body);
    await tag.save();
    
    res.status(201).json({
      message: 'Tag created successfully',
      tag
    });
  } catch (error) {
    console.error('Create tag error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tag with this title already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort_by, sort_order } = req.query;
    
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const sortField = sort_by || 'created_at';
    const sortVal = sort_order?.toUpperCase() === 'ASC' ? 1 : -1;
    const allowedSortFields = ['title', 'created_at'];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'created_at';

    const tags = await Tag.find(query)
      .sort({ [safeSortField]: sortVal })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Tag.countDocuments(query);

    res.status(200).json({
      tags,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get all tags error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
      
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    res.status(200).json(tag);
  } catch (error) {
    console.error('Get tag by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    res.status(200).json({
      message: 'Tag updated successfully',
      tag
    });
  } catch (error) {
    console.error('Update tag error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tag with this title already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
