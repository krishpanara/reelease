const { db } = require('../models');
const AITemplate = db.AITemplate;
const AITemplateCategory = db.AITemplateCategory;
const Blog = db.Blog;
const User = db.User;
const Subscription = db.Subscription;
const PaymentHistory = db.PaymentHistory;
const Attachment = db.Attachment;
const SocialPost = db.SocialPost;
const AIProvider = db.AIProvider;
const ContactInquiry = db.ContactInquiry;
const AITask = db.AITask;
const SocialAccount = db.SocialAccount;

exports.getDashboardData = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const aiFeatures = [
      {
        feature_key: 'text_to_image',
        display_name: 'Text to Image',
        description: 'Generate high-quality images from text prompts.',
        icon: 'image',
        credits: 5
      },
      {
        feature_key: 'image_to_image',
        display_name: 'Image to Image',
        description: 'Transform an existing image based on a prompt.',
        icon: 'images',
        credits: 5
      },
      {
        feature_key: 'images_to_video',
        display_name: 'Images to Video',
        description: 'Create cinematic videos from one or more images.',
        icon: 'video',
        credits: 20
      },
      {
        feature_key: 'text_to_video',
        display_name: 'Text to Video',
        description: 'Generate cinematic videos from text prompts.',
        icon: 'clapperboard',
        credits: 25
      },
      {
        feature_key: 'video_motion',
        display_name: 'Video Motion',
        description: 'Add motion control to images and videos.',
        icon: 'move',
        credits: 10
      },
    ];

    const categories = await AITemplateCategory.find({ status: true }).populate('attachment_id', 'file_path');

    const templateQuery = { status: true };
    if (type) {
      templateQuery.type = type;
    }

    const templates = await AITemplate.find(templateQuery)
      .populate('attachment_id', 'file_path file_type')
      .populate('category_id', 'name slug')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalTemplates = await AITemplate.countDocuments(templateQuery);

    const blogs = await Blog.find({ status: true })
      .populate('thumbnail_id', 'file_path')
      .populate('categories', 'name slug')
      .populate('tags', 'title')
      .sort({ created_at: -1 })
      .limit(4);

    res.status(200).json({
      aiFeatures,
      categories,
      templates: {
        data: templates,
        pagination: {
          total: totalTemplates,
          totalPages: Math.ceil(totalTemplates / limit),
          currentPage: Number(page),
          limit: Number(limit)
        }
      },
      blogs
    });
  } catch (error) {
    console.error('Get Dashboard Data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAdminDashboardData = async (req, res) => {
  try {
    const { timeFilter, startDate, endDate, revenueFilter = 'this_month' } = req.query;

    let dateFilter = {};
    if (timeFilter) {
      const now = new Date();
      if (timeFilter === 'today') {
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
        dateFilter = { $gte: startOfDay, $lte: endOfDay };
      } else if (timeFilter === 'this_week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { $gte: startOfWeek };
      } else if (timeFilter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { $gte: startOfMonth };
      } else if (timeFilter === 'this_year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { $gte: startOfYear };
      } else if (timeFilter === 'custom' && startDate && endDate) {
        dateFilter = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
    }

    let userFilter = {};
    let subscriptionFilter = { status: { $in: ['active', 'trial'] } };
    let attachmentFilter = {};
    let socialPostFilter = { status: 'published' };
    let aiProviderFilter = {};
    let blogFilter = {};
    let contactInquiryFilter = {};
    let paymentMatch = { payment_status: 'success' };
    let serviceUsageMatch = { status: 'completed' };

    if (Object.keys(dateFilter).length > 0) {
      userFilter.created_at = dateFilter;
      subscriptionFilter.created_at = dateFilter;
      attachmentFilter.created_at = dateFilter;
      socialPostFilter.published_at = dateFilter;
      aiProviderFilter.created_at = dateFilter;
      blogFilter.created_at = dateFilter;
      contactInquiryFilter.created_at = dateFilter;
      paymentMatch.paid_at = dateFilter;
      serviceUsageMatch.created_at = dateFilter;
    }

    const [
      totalUsers,
      activeSubscribers,
      totalMedia,
      totalPublishedPost,
      totalAIProviders,
      totalBlogs,
      totalInquiries,
      totalTemplates,
      totalUpcomingPosts,
      totalConnectedChannels,
      totalTasks
    ] = await Promise.all([
      User.countDocuments(userFilter),
      Subscription.countDocuments(subscriptionFilter),
      Attachment.countDocuments(attachmentFilter),
      SocialPost.countDocuments(socialPostFilter),
      AIProvider.countDocuments(aiProviderFilter),
      Blog.countDocuments(blogFilter),
      ContactInquiry.countDocuments(contactInquiryFilter),
      AITemplate.countDocuments({ status: true }),
      SocialPost.countDocuments({ status: 'scheduled' }),
      SocialAccount.countDocuments({ is_active: true }),
      AITask.countDocuments()
    ]);

    const revenueResult = await PaymentHistory.aggregate([
      { $match: paymentMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const [recentUsers, recentSocialActivity, recentTemplates] = await Promise.all([
      User.find().select('name email created_at').sort({ created_at: -1 }).limit(5),
      SocialPost.find({ status: 'published' })
        .populate('user', 'name email')
        .sort({ published_at: -1 })
        .limit(5),
      AITemplate.find()
        .populate('category_id', 'name')
        .populate('attachment_id', 'file_path')
        .sort({ created_at: -1 })
        .limit(5)
    ]);

    const recentTemplatesWithFlag = recentTemplates.map(t => {
      const obj = t.toJSON ? t.toJSON() : t;
      obj.is_system = true;
      return obj;
    });

    const now = new Date();
    let formattedRevenue = [];

    if (revenueFilter === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const dailyRevenue = await PaymentHistory.aggregate([
        {
          $match: {
            payment_status: 'success',
            paid_at: {
              $gte: startOfMonth,
              $lt: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: '$paid_at' },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayData = dailyRevenue.find(item => item._id === day);
        formattedRevenue.push({
          month: `${day}`,
          amount: dayData ? dayData.amount : 0
        });
      }
    } else if (revenueFilter === 'last_month') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const dailyRevenue = await PaymentHistory.aggregate([
        {
          $match: {
            payment_status: 'success',
            paid_at: {
              $gte: startOfLastMonth,
              $lt: endOfLastMonth
            }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: '$paid_at' },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      for (let day = 1; day <= daysInLastMonth; day++) {
        const dayData = dailyRevenue.find(item => item._id === day);
        formattedRevenue.push({
          month: `${day}`,
          amount: dayData ? dayData.amount : 0
        });
      }
    } else {
      const currentYear = now.getFullYear();
      const revenuePerMonth = await PaymentHistory.aggregate([
        {
          $match: {
            payment_status: 'success',
            paid_at: {
              $gte: new Date(`${currentYear}-01-01`),
              $lt: new Date(`${currentYear + 1}-01-01`)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$paid_at' },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      formattedRevenue = monthNames.map((name, index) => {
        const monthData = revenuePerMonth.find(item => item._id === index + 1);
        return {
          month: name,
          amount: monthData ? monthData.amount : 0
        };
      });
    }


    const serviceUsage = await AITask.aggregate([
      { $match: serviceUsageMatch },
      { $group: { _id: '$service_type', count: { $sum: 1 } } }
    ]);

    const serviceUsageMap = {};
    serviceUsage.forEach(item => {
      serviceUsageMap[item._id] = item.count;
    });

    const knownServices = [
      'text_to_image',
      'image_to_image',
      'images_to_video',
      'text_to_video',
      'video_motion',
    ];

    const formattedServiceUsage = knownServices.map(key => ({
      service_key: key,
      service: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: serviceUsageMap[key] || 0
    }));

    serviceUsage.forEach(item => {
      if (!knownServices.includes(item._id)) {
        formattedServiceUsage.push({
          service_key: item._id,
          service: item._id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: item.count
        });
      }
    });

    res.status(200).json({
      statistics: {
        totalUsers,
        activeSubscribers,
        totalRevenue,
        totalMedia,
        totalPublishedPost,
        totalAIProviders,
        totalBlogs,
        totalInquiries,
        totalTemplates,
        totalUpcomingPosts,
        totalConnectedChannels,
        totalTasks
      },
      recentActivities: {
        recentUsers,
        recentSocialActivity,
        recentTemplates: recentTemplatesWithFlag
      },
      charts: {
        revenuePerMonth: formattedRevenue,
        serviceUsagePieChart: formattedServiceUsage
      }
    });
  } catch (error) {
    console.error('Get Admin Dashboard Data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};