const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.get('/', tagController.getAll);
router.get('/:id', tagController.getById);

router.use(authenticate);
router.post('/', checkPermission('create.tags'), tagController.create);
router.put('/:id', checkPermission('update.tags'), tagController.update);
router.delete('/:id', checkPermission('delete.tags'), tagController.delete);

module.exports = router;
