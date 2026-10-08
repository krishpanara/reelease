'use strict';

const mongoose = require('mongoose');
const { db } = require('../models');
const Role = db.Role;
const Permission = db.Permission;
const RolePermission = db.RolePermission;

const parsePaginationParams = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 15));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

exports.getRoles = async (req, res) => {
  try {
    const { search, sort_by, sort_order } = req.query;
    const { page, limit, skip } = parsePaginationParams(req.query);

    const query = {};
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const sort = {};
    if (sort_by) {
      sort[sort_by] = sort_order === 'DESC' ? -1 : 1;
    } else {
      sort.created_at = -1;
    }

    const [roles, total] = await Promise.all([
      Role.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Role.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        roles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error('getRoles error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch roles' });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid role ID' });
    }

    const role = await Role.findById(id).lean();
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const rolePermissions = await RolePermission.find({ role_id: id })
      .populate('permission_id')
      .lean();

    const permissions = rolePermissions
      .filter(rp => rp.permission_id)
      .map(rp => rp.permission_id);

    return res.status(200).json({ 
      success: true, 
      data: { role, permissions } 
    });
  } catch (error) {
    console.error('getRoleById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch role' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const normalized = name.trim().toLowerCase().replace(/\s+/g, '_');

    const existing = await Role.findOne({ name: normalized });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A role with this name already exists' });
    }

    const role = await Role.create({
      name: normalized,
      description: description ? description.trim() : undefined,
      system_reserved: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    console.error('createRole error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create role' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid role ID' });
    }

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.system_reserved) {
      return res.status(403).json({ success: false, message: 'System-reserved roles cannot be modified' });
    }

    if (name && name.trim()) {
      const normalized = name.trim().toLowerCase().replace(/\s+/g, '_');
      const conflict = await Role.findOne({ name: normalized, _id: { $ne: id } });
      if (conflict) {
        return res.status(409).json({ success: false, message: 'A role with this name already exists' });
      }
      role.name = normalized;
    }

    if (description !== undefined) {
      role.description = description ? description.trim() : role.description;
    }

    await role.save();

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (error) {
    console.error('updateRole error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update role' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid role ID' });
    }

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.system_reserved) {
      return res.status(403).json({ success: false, message: 'System-reserved roles cannot be deleted' });
    }

    await RolePermission.deleteMany({ role_id: id });
    await Role.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('deleteRole error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete role' });
  }
};

exports.getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid role ID' });
    }

    const role = await Role.findById(id).lean();
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const rolePermissions = await RolePermission.find({ role_id: id })
      .populate('permission_id')
      .lean();

    const permissions = rolePermissions
      .filter(rp => rp.permission_id)
      .map(rp => rp.permission_id);

    return res.status(200).json({
      success: true,
      data: { role, permissions },
    });
  } catch (error) {
    console.error('getRolePermissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch role permissions' });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_ids } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid role ID' });
    }

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({ success: false, message: 'permission_ids must be an array' });
    }

    const validIds = permission_ids.filter(pid => mongoose.Types.ObjectId.isValid(pid));
    const existingPermissions = await Permission.find({ _id: { $in: validIds } }).lean();

    if (existingPermissions.length !== validIds.length) {
      return res.status(400).json({ success: false, message: 'One or more permission IDs are invalid' });
    }

    await RolePermission.deleteMany({ role_id: id });

    if (validIds.length > 0) {
      const newEntries = validIds.map(pid => ({
        role_id: id,
        permission_id: pid,
      }));
      await RolePermission.insertMany(newEntries);
    }

    return res.status(200).json({
      success: true,
      message: `Updated permissions for role '${role.name}'`,
      data: { assignedCount: validIds.length },
    });
  } catch (error) {
    console.error('updateRolePermissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update role permissions' });
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().lean();
    return res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    console.error('getAllPermissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch permissions' });
  }
};
