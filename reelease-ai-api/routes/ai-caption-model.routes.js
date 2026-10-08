const express = require('express');
const router = express.Router();
const aiCaptionModelController = require('../controllers/ai-caption-model.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.get('/active', aiCaptionModelController.getActiveModels);

router.get('/', checkPermission('view.ai_caption_models'), aiCaptionModelController.getListModels);
router.get('/:id', checkPermission('view.ai_caption_models'), aiCaptionModelController.getModelById);
router.post('/', checkPermission('create.ai_caption_models'), aiCaptionModelController.createModel);
router.put('/:id', checkPermission('update.ai_caption_models'), aiCaptionModelController.updateModel);
router.delete('/delete', checkPermission('delete.ai_caption_models'), aiCaptionModelController.deleteModels);
router.delete('/:id', checkPermission('delete.ai_caption_models'), aiCaptionModelController.deleteModel);
router.post('/:id/set-default', checkPermission('update.ai_caption_models'), aiCaptionModelController.setAsDefault);
router.post('/:id/toggle-active', checkPermission('update.ai_caption_models'), aiCaptionModelController.toggleActive);

module.exports = router;
