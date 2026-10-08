const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/email-template.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.get('/', checkPermission('view.email_templates'), emailTemplateController.getAllEvents);
router.put('/:slug', checkPermission('update.email_templates'), emailTemplateController.updateTemplate);

module.exports = router;
