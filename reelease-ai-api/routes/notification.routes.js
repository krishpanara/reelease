const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.get('/', checkPermission('view.notifications'), notificationController.getNotifications);
router.put('/read-all', checkPermission('update.notifications'), notificationController.markAllAsRead);
router.put('/:notificationId/read', checkPermission('update.notifications'), notificationController.markAsRead);
router.post('/delete', checkPermission('delete.notifications'), notificationController.deleteNotifications);


module.exports = router;
