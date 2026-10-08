const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.get('/', authenticate, checkPermission('view.dashboard'), dashboardController.getDashboardData);
router.get('/admin', authenticate, checkPermission('view.admin_dashboard'), dashboardController.getAdminDashboardData);

module.exports = router;
