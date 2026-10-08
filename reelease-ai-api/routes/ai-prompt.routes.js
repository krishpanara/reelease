const express = require('express');
const router = express.Router();
const aiPromptController = require('../controllers/ai-prompt.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.get('/', aiPromptController.getPrompts);
router.get('/categories', aiPromptController.getCategories);
router.get('/:id', aiPromptController.getPromptById);

router.use(authenticate);
router.post('/', checkPermission('create.ai_prompt'), aiPromptController.createPrompt);
router.put('/:id', checkPermission('update.ai_prompt'), aiPromptController.updatePrompt);
router.delete('/delete', checkPermission('delete.ai_prompt'), aiPromptController.deletePrompt);

module.exports = router;