const Attachment = require('../models/attachment.model');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const attachments = [];

    for (const file of req.files) {
      const newAttachment = new Attachment({
        name: file.originalname,
        file_path: file.path,
        file_type: file.mimetype.split('/')[0],
        file_size: file.size,
        mime_type: file.mimetype,
        is_generated: false,
        created_by: req.user._id
      });
      await newAttachment.save();
      attachments.push(newAttachment);
    }

    res.status(201).json({
      message: 'Files uploaded successfully',
      attachments
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const adminRoles = await Role.find({ name: { $in: ['admin', 'super_admin'] } }).distinct('_id');
    const adminUserIds = await User.find({ roleId: { $in: adminRoles } }).distinct('_id');

    const query = {
      $or: [
        { created_by: req.user._id },
        { created_by: { $in: adminUserIds } }
      ]
    };

    if (type) {
      query.file_type = type;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (req.query.is_generated !== undefined) {
      query.is_generated = req.query.is_generated === 'true';
    }

    const attachments = await Attachment.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Attachment.countDocuments(query);

    res.status(200).json({
      attachments: attachments,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get all attachments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    res.status(200).json(attachment);
  } catch (error) {
    console.error('Get attachment by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of attachment IDs' });
    }

    const attachments = await Attachment.find({ _id: { $in: ids } });

    for (const attachment of attachments) {
      const filePath = path.join(__dirname, '..', attachment.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Attachment.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: 'Attachments deleted successfully' });
  } catch (error) {
    console.error('Bulk delete attachments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const attachment = await Attachment.findById(id);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    if (name && !req.file) {
      const oldFilePath = path.join(__dirname, '..', attachment.file_path);

      if (fs.existsSync(oldFilePath)) {
        const ext = path.extname(oldFilePath);
        const newFileName = name.replace(/\s+/g, '_') + ext;

        const newFilePath = path.join(
          path.dirname(oldFilePath),
          newFileName
        );

        fs.renameSync(oldFilePath, newFilePath);

        attachment.file_path = path.relative(
          path.join(__dirname, '..'),
          newFilePath
        );
      }

      attachment.name = name;
    }

    await attachment.save();

    res.status(200).json({
      message: 'Attachment updated successfully',
      attachment
    });

  } catch (error) {
    console.error('Update attachment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
