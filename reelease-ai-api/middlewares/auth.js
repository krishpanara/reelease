'use strict';

const jwt = require('jsonwebtoken');
const { db } = require('../models');
const User = db.User;
const Session = db.Session;
const RolePermission = db.RolePermission;

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate('roleId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token: user not found' });
    }

    const session = await Session.findOne({ user_id: user._id, session_token: token, status: 'active' });
    if (!session) {
      return res.status(401).json({ message: 'Session expired or logged out. Please log in again.' });
    }

    if (session.expires_at && new Date() > new Date(session.expires_at)) {
      await Session.updateOne({ _id: session._id }, { $set: { status: 'inactive' } });
      return res.status(401).json({ message: 'Session expired or logged out. Please log in again.' });
    }

    const roleId = user.roleId ? (user.roleId._id || user.roleId) : null;
    if (roleId) {
      const rolePerms = await RolePermission.find({ role_id: roleId })
        .populate('permission_id', 'slug')
        .lean();
      user.permissionSlugs = rolePerms
        .filter(rp => rp.permission_id)
        .map(rp => rp.permission_id.slug);
    } else {
      user.permissionSlugs = [];
    }

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.error('JWT error:', err);
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};