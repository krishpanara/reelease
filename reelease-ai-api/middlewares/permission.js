'use strict';

const { db } = require('../models');
const Permission = db.Permission;
const RolePermission = db.RolePermission;

exports.checkPermission = (permissionSlug) => {
  return async (req, res, next) => {
    try {

      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const role = user.roleId && user.roleId.name ? user.roleId : null;
      const roleName = role ? role.name : null;

      if (roleName === 'super_admin') {
        return next();
      }

      const roleId = role ? role._id : user.roleId;
      if (!roleId) {
        return res.status(403).json({ success: false, message: 'Forbidden: No role assigned to user' });
      }

      const permissionDoc = await Permission.findOne({ slug: permissionSlug }).lean();
      if (!permissionDoc) {
        return res.status(403).json({ success: false, message: `Invalid permission: '${permissionSlug}'` });
      }

      const hasPermission = await RolePermission.exists({
        role_id: roleId,
        permission_id: permissionDoc._id
      });

      if (!hasPermission) {
        const featureMap = {
          'create.characters': 'character_generation',
          'create.ecommerce_catalogue': 'ecommerce_catalogue',
          'create.text_to_image': 'text_to_image',
          'create.image_to_image': 'image_to_image',
          'create.text_to_video': 'text_to_video',
          'create.image_to_video': 'images_to_video',
          'create.video_motion': 'video_motion',
          'create.captions': 'ai_caption_generator',
          'create.ai_generation': 'dynamic'
        };

        const featureKey = featureMap[permissionSlug];
        if (featureKey) {
          const User = db.User;
          const userWithPlan = await User.findById(user._id).populate('plan_id').lean();
          if (userWithPlan && userWithPlan.plan_id && userWithPlan.plan_id.ai_features) {
            let actualFeatureKey = featureKey;
            if (featureKey === 'dynamic') {
              actualFeatureKey = req.body?.overrideServiceType || req.body?.serviceType;
            }
            if (actualFeatureKey && userWithPlan.plan_id.ai_features[actualFeatureKey] === true) {
              req.user.hasRolePermission = false;
              return next();
            }
          }
        }
        return res.status(403).json({ success: false, message: 'Access denied: Insufficient permissions or plan does not include this feature' });
      }

      req.user.hasRolePermission = true;

      return next();

    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};