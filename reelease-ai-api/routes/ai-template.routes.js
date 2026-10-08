const express = require('express');
const router = express.Router();
const aiTemplateController = require('../controllers/ai-template.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');
const upload = require('../middlewares/upload');

router.get('/', aiTemplateController.getTemplates);
router.get('/:id', aiTemplateController.getTemplateById);

router.use(authenticate);
router.post('/', checkPermission('create.ai_templates'), upload.single('file'), aiTemplateController.createTemplate);
router.put('/:id', checkPermission('update.ai_templates'), upload.single('file'), aiTemplateController.updateTemplate);
router.delete('/:id', checkPermission('delete.ai_templates'), aiTemplateController.deleteTemplate);

module.exports = router;
