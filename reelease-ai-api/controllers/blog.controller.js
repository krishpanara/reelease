const Blog = require('../models/blog.model');
const Category = require('../models/category.model');

exports.create = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id)
      .populate('thumbnail_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('categories', 'name')
      .populate('tags', 'title');

    res.status(201).json({
      message: 'Blog created successfully',
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Create blog error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Blog slug already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, is_featured, category } = req.query;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (status !== undefined) {
      query.status = status === 'true';
    }
    if (is_featured !== undefined) {
      query.is_featured = is_featured === 'true';
    }
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categories = category;
      } else {
        const cat = await Category.findOne({ $or: [{ slug: category }, { name: category }] });
        if (cat) {
          query.categories = cat._id;
        } else {
          query.categories = null;
        }
      }
    }

    const blogs = await Blog.find(query)
      .select('title description content thumbnail_id meta_image_id categories tags created_at')
      .populate('thumbnail_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('categories', 'name')
      .populate('tags', 'title')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const transformedBlogs = blogs.map(blog => ({
      ...blog,
      id: blog._id,
      thumbnail_id: blog.thumbnail_id?.file_path || null
    }));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      blogs: transformedBlogs,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .select('title description content thumbnail_id meta_image_id categories tags slug meta_title meta_description is_featured status created_at')
      .populate('thumbnail_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('categories', 'name')
      .populate('tags', 'title');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error('Get blog by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .select('title description content thumbnail_id categories tags slug meta_title meta_description is_featured created_at status')
      .populate('thumbnail_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('categories', 'name')
      .populate('tags', 'title');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('thumbnail_id', 'file_path name mime_type')
      .populate('meta_image_id', 'file_path name mime_type')
      .populate('categories', 'name')
      .populate('tags', 'title');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Content is required' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Blog slug already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
