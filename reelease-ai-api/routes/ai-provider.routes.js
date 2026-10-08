const express = require('express');
const router = express.Router();
const aiProviderController = require('../controllers/ai-provider.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.post('/test', checkPermission('test.ai_providers'), aiProviderController.testProvider);
router.get('/task/:taskId', checkPermission('test.ai_providers'), aiProviderController.getTaskStatus);

router.post('/', checkPermission('create.ai_providers'), aiProviderController.createProvider);
router.get('/', checkPermission('view.ai_providers'), aiProviderController.getProviders);
router.get('/:id', checkPermission('view.ai_providers'), aiProviderController.getProviderById);
router.put('/:id', checkPermission('update.ai_providers'), aiProviderController.updateProvider);
router.delete('/:id', checkPermission('delete.ai_providers'), aiProviderController.deleteProvider);

module.exports = router;
