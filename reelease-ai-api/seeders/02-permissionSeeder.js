require('dotenv').config();

const bcrypt = require('bcryptjs');

const modules = {
  dashboard: {
    actions: { view: 'view.dashboard' },
    roles: { ADMIN: ['view'], USER: ['view'] }
  },
  adminDashboard: {
    actions: { view: 'view.admin_dashboard' },
    roles: { ADMIN: ['view'] }
  },
  members: {
    actions: {
      view: 'view.members',
      create: 'create.members',
      update: 'update.members',
      delete: 'delete.members',
    },
    roles: { ADMIN: ['view', 'create', 'update', 'delete'] }
  },
  roles: {
    actions: {
      view: 'view.roles',
      create: 'create.roles',
      update: 'update.roles',
      delete: 'delete.roles',
    },
    roles: { ADMIN: ['view', 'create', 'update', 'delete'] }
  },
  plans: {
    actions: {
      view: 'view.plans',
      create: 'create.plans',
      update: 'update.plans',
      delete: 'delete.plans',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view'],
    }
  },
  subscriptions: {
    actions: {
      view: 'view.subscriptions',
      create: 'create.subscriptions',
      update: 'update.subscriptions',
    },
    roles: {
      ADMIN: ['view', 'create', 'update'],
      USER: ['view', 'create', 'update'],
    }
  },
  faqs: {
    actions: {
      view: 'view.faqs',
      create: 'create.faqs',
      update: 'update.faqs',
      delete: 'delete.faqs',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
    }
  },
  languages: {
    actions: {
      view: 'view.languages',
      create: 'create.languages',
      update: 'update.languages',
      delete: 'delete.languages',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view'],
    }
  },
  inquiries: {
    actions: {
      view: 'view.inquiries',
      create: 'create.inquiries',
      delete: 'delete.inquiries',
    },
    roles: {
      ADMIN: ['view', 'delete'],
      USER: ['create'],
    }
  },
  pages: {
    actions: {
      view: 'view.pages',
      create: 'create.pages',
      update: 'update.pages',
      delete: 'delete.pages',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
    }
  },
  blogs: {
    actions: {
      view: 'view.blogs',
      create: 'create.blogs',
      update: 'update.blogs',
      delete: 'delete.blogs',
      manage: 'manage.blogs',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete', 'manage'],
      USER: ['view'],
    }
  },
  categories: {
    actions: {
      view: 'view.categories',
      create: 'create.categories',
      update: 'update.categories',
      delete: 'delete.categories',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
    }
  },
  tags: {
    actions: {
      view: 'view.tags',
      create: 'create.tags',
      update: 'update.tags',
      delete: 'delete.tags',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
    }
  },
  settings: {
    actions: { view: 'view.settings', update: 'update.settings' },
    roles: {
      ADMIN: ['view', 'update'],
    }
  },
  userSettings: {
    actions: { view: 'view.user_settings', update: 'update.user_settings' },
    roles: {
      ADMIN: ['view', 'update'],
      USER: ['view', 'update'],
    }
  },
  transactions: {
    actions: { view: 'view.transactions' },
    roles: {
      ADMIN: ['view'],
    }
  },
  aiProviders: {
    actions: {
      view: 'view.ai_providers',
      create: 'create.ai_providers',
      update: 'update.ai_providers',
      delete: 'delete.ai_providers',
      test: 'test.ai_providers',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete', 'test'],
    }
  },
  testimonials: {
    actions: {
      view: 'view.testimonials',
      create: 'create.testimonials',
      update: 'update.testimonials',
      delete: 'delete.testimonials',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view'],
    }
  },
  paymentSetup: {
    actions: {
      view: 'view.payment_setup',
      update: 'update.payment_setup',
    },
    roles: {
      ADMIN: ['view', 'update'],
    }
  },
  mediaLibrary: {
    actions: {
      view: 'view.media_library',
      create: 'create.media_library',
      update: 'update.media_library',
      delete: 'delete.media_library',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view', 'create', 'update', 'delete' ],
    }
  },
  templateCategories: {
    actions: {
      view: 'view.ai_template_categories',
      create: 'create.ai_template_categories',
      update: 'update.ai_template_categories',
      delete: 'delete.ai_template_categories',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view'],
    }
  },
  promptsTemplates: {
    actions: {
      view: 'view.ai_prompt',
      create: 'create.ai_prompt',
      update: 'update.ai_prompt',
      delete: 'delete.ai_prompt',
      manage: 'manage.ai_prompt',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete', 'manage'],
      USER: ['view'],
    }
  },
  textToImage: {
    actions: {
      view: 'view.text_to_image',
      create: 'create.text_to_image',
    },
    roles: {
      USER: ['view', 'create'],
    }
  },
  imageToImage: {
    actions: {
      view: 'view.image_to_image',
      create: 'create.image_to_image',
    },
    roles: {
      USER: ['view', 'create'],
    }
  },
  textToVideo: {
    actions: {
      view: 'view.text_to_video',
      create: 'create.text_to_video',
    },
    roles: {
      USER: ['view', 'create'],
    }
  },
  imageToVideo: {
    actions: {
      view: 'view.image_to_video',
      create: 'create.image_to_video',
    },
    roles: {
      USER: ['view', 'create'],
    }
  },
  videoMotion: {
    actions: {
      view: 'view.video_motion',
      create: 'create.video_motion',
    },
    roles: {
      USER: ['view', 'create'],
    }
  },
  channels: {
    actions: {
      view: 'view.channels',
      create: 'create.channels',
      update: 'update.channels',
      delete: 'delete.channels',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view', 'create', 'update', 'delete'],
    }
  },
  socialPost: {
    actions: {
      view: 'view.social_post',
      create: 'create.social_post',
      update: 'update.social_post',
      delete: 'delete.social_post',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view', 'create'],
    }
  },
  aiTemplates: {
    actions: {
      view: 'view.ai_templates',
      create: 'create.ai_templates',
      update: 'update.ai_templates',
      delete: 'delete.ai_templates',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
      USER: ['view'],
    }
  },
  usageLogs: {
    actions: { view: 'view.usage_logs' },
    roles: {
      USER: ['view'],
    }
  },
  ecommerce_catalogue: {
    actions: {
      view: 'view.ecommerce_catalogue',
      create: 'create.ecommerce_catalogue',
      delete: 'delete.ecommerce_catalogue',
    },
    roles: {
      USER: ['view', 'create', 'delete'],
    }
  },
  aiGeneration: {
    actions: {
      view: 'view.ai_generation',
      create: 'create.ai_generation',
    },
    roles: {
      USER: ['view', 'create'],
    }
  },
  captions: {
    actions: {
      view: 'view.captions',
      create: 'create.captions',
      update: 'update.captions',
      delete: 'delete.captions',
    },
    roles: {
      USER: ['view', 'create', 'update', 'delete'],
    }
  },
  characters: {
    actions: {
      view: 'view.characters',
      create: 'create.characters',
      update: 'update.characters',
      delete: 'delete.characters',
    },
    roles: {
      USER: ['view', 'create', 'update', 'delete'],
    }
  },
  emailTemplates: {
    actions: {
      view: 'view.email_templates',
      update: 'update.email_templates',
    },
    roles: {
      ADMIN: ['view', 'update'],
    }
  },
  notifications: {
    actions: {
      view: 'view.notifications',
      update: 'update.notifications',
      delete: 'delete.notifications',
    },
    roles: {
      ADMIN: ['view', 'update', 'delete'],
      USER: ['view', 'update', 'delete'],
    }
  },
  aiCaptionModels: {
    actions: {
      view: 'view.ai_caption_models',
      create: 'create.ai_caption_models',
      update: 'update.ai_caption_models',
      delete: 'delete.ai_caption_models',
    },
    roles: {
      ADMIN: ['view', 'create', 'update', 'delete'],
    }
  }
};


const seedPermissions = async (dbConnection, mongoose) => {
  try {
    const Permission = dbConnection.db.Permission;
    const Role = dbConnection.db.Role;
    const RolePermission = dbConnection.db.RolePermission;
    const User = dbConnection.db.User;

    console.log('Seeding permissions...');

    try {
      await Permission.collection.dropIndex('module_1');
    } catch (err) {
    }

    const permissionList = [];
    Object.values(modules).forEach(module => {
      Object.entries(module.actions).forEach(([actionKey, slug]) => {
        const name = slug.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        permissionList.push({
          name,
          slug,
          description: `Permission to ${actionKey} ${slug.split('.')[1] || ''}`
        });
      });
    });

    const ops = permissionList.map(p => ({
      updateOne: {
        filter: { slug: p.slug },
        update: { $set: p },
        upsert: true
      }
    }));
    await Permission.bulkWrite(ops);
    console.log('Permissions seeded successfully!');

    const allPermissions = await Permission.find().lean();
    const permissionMap = {};
    allPermissions.forEach(p => { permissionMap[p.slug] = p._id; });

    const roleMapping = {
      ADMIN: ['super_admin', 'admin'],
      USER: ['user'],
      FREE_USER: ['free_user']
    };

    for (const [key, roleNames] of Object.entries(roleMapping)) {
      for (const roleName of roleNames) {
        const role = await Role.findOne({ name: roleName });
        if (!role) continue;

        const rolePermissionIds = [];
        Object.values(modules).forEach(module => {
          const actions = module.roles[key] || [];
          actions.forEach(actionKey => {
            const slug = module.actions[actionKey];
            if (slug && permissionMap[slug]) {
              rolePermissionIds.push(permissionMap[slug]);
            }
          });
        });

        if (rolePermissionIds.length > 0) {
          await RolePermission.deleteMany({ role_id: role._id });

          const uniqueIds = [...new Set(rolePermissionIds.map(id => id.toString()))];
          const rolePermissionsData = uniqueIds.map(id => ({
            role_id: role._id,
            permission_id: id
          }));

          await RolePermission.insertMany(rolePermissionsData);
        }
      }
    }

    console.log('Permission seeding and role assignment completed successfully!');

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.log('ADMIN_EMAIL not set, skipping default admin creation');
    } else {
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const superAdminRole = await Role.findOne({ name: 'super_admin' });

        await User.create({
          name: process.env.ADMIN_NAME || 'Admin',
          email: adminEmail,
          password: hashedPassword,
          roleId: superAdminRole ? superAdminRole._id : null,
          isVerified: true,
          isActive: true,
        });
        console.log(`Default admin created: ${adminEmail}`);
      } else {
        if (!existingAdmin.roleId) {
          const superAdminRole = await Role.findOne({ name: 'super_admin' });
          if (superAdminRole) {
            await User.findByIdAndUpdate(existingAdmin._id, { roleId: superAdminRole._id });
            console.log(`Updated existing admin role: ${adminEmail}`);
          }
        }
      }
    }

    const defaultUserEmail = process.env.DEFAULT_USER_EMAIL;

    if (!defaultUserEmail) {
    } else {
      const existingUser = await User.findOne({ email: defaultUserEmail });
      if (!existingUser) {
        const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || 'user123';
        const hashedPassword = await bcrypt.hash(defaultUserPassword, 10);
        const userRole = await Role.findOne({ name: 'user' });

        await User.create({
          name: process.env.DEFAULT_USER_NAME || 'Default User',
          email: defaultUserEmail,
          password: hashedPassword,
          roleId: userRole ? userRole._id : null,
          isVerified: true,
          isActive: true,
        });
        console.log(`Default user created: ${defaultUserEmail}`);
      } else {
        if (!existingUser.roleId) {
          const userRole = await Role.findOne({ name: 'user' });
          if (userRole) {
            await User.findByIdAndUpdate(existingUser._id, { roleId: userRole._id });
            console.log(`Updated existing user role: ${defaultUserEmail}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error;
  }
};

module.exports = { up: seedPermissions };
