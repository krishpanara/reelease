const { db } = require('../models');
const AITemplate = db.AITemplate;
const Attachment = db.Attachment;
const AITemplateCategory = db.AITemplateCategory;

exports.createTemplate = async (req, res) => {
  try {
    const { title, description, category_id, prompt, status, attachment_id } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ message: 'Title and category_id are required.' });
    }

    let finalAttachmentId = attachment_id;
    let templateType = 'image';

    if (req.file) {
      const newAttachment = new Attachment({
        name: req.file.originalname,
        file_path: `/uploads/${req.file.filename}`,
        file_type: req.file.mimetype.split('/')[0],
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        is_generated: false
      });
      await newAttachment.save();
      finalAttachmentId = newAttachment._id;
      templateType = newAttachment.file_type === 'video' ? 'video' : 'image';
    } else if (attachment_id) {
      const existingAttachment = await Attachment.findById(attachment_id);
      if (!existingAttachment) {
        return res.status(404).json({ message: 'Selected attachment not found.' });
      }
      templateType = existingAttachment.file_type === 'video' ? 'video' : 'image';
    } else {
      return res.status(400).json({ message: 'Template file (image or video) or an existing attachment_id is required.' });
    }

    const template = new AITemplate({
      title,
      description,
      attachment_id: finalAttachmentId,
      category_id,
      type: templateType,
      prompt,
      status: status !== undefined ? status : true
    });

    await template.save();

    res.status(201).json({
      message: 'AI Template created successfully.',
      template
    });
  } catch (error) {
    console.error('Create AI Template error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A template with the same category, prompt, and attachment already exists.' });
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');

      return res.status(400).json({ message });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, type, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { prompt: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category_id = category;
      } else {
        const cat = await AITemplateCategory.findOne({
          $or: [
            { slug: category },
            { name: category }
          ]
        });
        if (cat) query.category_id = cat._id;
        else query.category_id = null;
      }
    }

    if (type) {
      query.type = type;
    }

    if (status !== undefined) {
      query.status = status === 'true';
    }

    const templates = await AITemplate.find(query)
      .populate('attachment_id', 'name file_path file_type file_size mime_type')
      .populate('category_id', 'name slug description')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AITemplate.countDocuments(query);

    res.status(200).json({
      templates,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get AI Templates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await AITemplate.findById(req.params.id)
      .populate('attachment_id', 'name file_path file_type file_size mime_type')
      .populate('category_id', 'name slug description');
    if (!template) {
      return res.status(404).json({ message: 'Template not found.' });
    }
    res.status(200).json(template);
  } catch (error) {
    console.error('Get AI Template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { title, description, category_id, prompt, status, attachment_id } = req.body;
    const template = await AITemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found.' });
    }

    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (category_id) template.category_id = category_id;
    if (prompt !== undefined) template.prompt = prompt;
    if (status !== undefined) template.status = status;

    if (req.file) {
      const newAttachment = new Attachment({
        name: req.file.originalname,
        file_path: `/uploads/${req.file.filename}`,
        file_type: req.file.mimetype.split('/')[0],
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        is_generated: false
      });
      await newAttachment.save();

      template.attachment_id = newAttachment._id;
      template.type = newAttachment.file_type === 'video' ? 'video' : 'image';
    } else if (attachment_id) {
      const existingAttachment = await Attachment.findById(attachment_id);
      if (existingAttachment) {
        template.attachment_id = existingAttachment._id;
        template.type = existingAttachment.file_type === 'video' ? 'video' : 'image';
      }
    }

    await template.save();

    res.status(200).json({
      message: 'AI Template updated successfully.',
      template
    });
  } catch (error) {
    console.error('Update AI Template error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ message: 'A template with the same category, prompt, and attachment already exists.' });
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');

      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await AITemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found.' });
    }


    await AITemplate.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Template deleted successfully.' });
  } catch (error) {
    console.error('Delete AI Template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
