const { db } = require('../models');
const AITemplateCategory = db.AITemplateCategory;

exports.createCategory = async (req, res) => {
  try {
    const { name, description, attachment_id, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const slug = req.body.slug || (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));

    const category = new AITemplateCategory({
      name,
      slug,
      description,
      attachment_id,
      status: status !== undefined ? status : true
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this slug already exists.' });
    }
    console.error('Create AI Template Category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      query.status = status === 'true';
    }

    const categories = await AITemplateCategory.find(query)
      .populate('attachment_id')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AITemplateCategory.countDocuments(query);

    res.status(200).json({
      categories,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get AI Template Categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await AITemplateCategory.findById(req.params.id).populate('attachment_id');
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Get AI Template Category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, description, attachment_id, status } = req.body;
    const category = await AITemplateCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (attachment_id !== undefined) category.attachment_id = attachment_id;
    if (status !== undefined) category.status = status;

    await category.save();

    res.status(200).json({
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this slug already exists.' });
    }
    console.error('Update AI Template Category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await AITemplateCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete AI Template Category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
