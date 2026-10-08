const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.get('/', categoryController.getAll);
router.get('/tree', categoryController.getAll); 
router.get('/:id', categoryController.getById);

router.use(authenticate);
router.post('/', checkPermission('create.categories'), categoryController.create);
router.put('/:id', checkPermission('update.categories'), categoryController.update);
router.delete('/:id', checkPermission('delete.categories'), categoryController.delete);

module.exports = router;
