const Category = require('../models/category.model');

exports.create = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();

    const populatedCategory = await Category.findById(category._id)
      .populate('image_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('parent_id');

    res.status(201).json({
      message: 'Category created successfully',
      category: populatedCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { search, status, page, limit } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status !== undefined) {
      query.status = status === 'true';
    }

    let categoriesQuery = Category.find(query)
      .select('name description image_id status parent_id slug meta_title meta_description meta_image_id')
      .populate('image_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('parent_id')
      .sort({ created_at: -1 });

    const total = await Category.countDocuments(query);
    let totalPages = 1;
    let currentPage = 1;

    if (limit) {
      const parsedLimit = parseInt(limit, 10) || 10;
      currentPage = parseInt(page, 10) || 1;
      totalPages = Math.ceil(total / parsedLimit);
      categoriesQuery = categoriesQuery.skip((currentPage - 1) * parsedLimit).limit(parsedLimit);
    }

    const categories = await categoriesQuery.lean();

    if (!limit) {
      const catMap = {};
      categories.forEach(cat => {
        cat.children = [];
        catMap[cat._id] = cat;
      });

      const tree = [];
      categories.forEach(cat => {
        const pId = cat.parent_id?._id || cat.parent_id;
        if (pId && catMap[pId]) {
          catMap[pId].children.push(cat);
        } else {
          tree.push(cat);
        }
      });
      return res.status(200).json({ categories: tree, totalPages: 1, currentPage: 1, total });
    }

    res.status(200).json({ categories, totalPages, currentPage, total });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('image_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('parent_id');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('image_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('parent_id');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const hasChildren = await Category.exists({ parent_id: req.params.id });
    if (hasChildren) {
      return res.status(400).json({ message: 'Cannot delete category with sub-categories. Please delete or reassign them first.' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
