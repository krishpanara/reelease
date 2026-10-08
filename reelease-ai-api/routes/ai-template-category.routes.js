const express = require('express');
const router = express.Router();
const aiTemplateCategoryController = require('../controllers/ai-template-category.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.get('/', aiTemplateCategoryController.getCategories);
router.get('/:id', aiTemplateCategoryController.getCategoryById);

router.use(authenticate);
router.post('/', checkPermission('create.ai_template_categories'), aiTemplateCategoryController.createCategory);
router.put('/:id', checkPermission('update.ai_template_categories'), aiTemplateCategoryController.updateCategory);
router.delete('/:id', checkPermission('delete.ai_template_categories'), aiTemplateCategoryController.deleteCategory);

module.exports = router;
