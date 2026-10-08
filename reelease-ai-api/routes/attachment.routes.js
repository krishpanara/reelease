const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachment.controller');
const upload = require('../middlewares/upload');
const { uploadSingle, uploadFiles } = require('../utils/upload');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.post('/upload', checkPermission('create.media_library'), uploadFiles('attachments', 'files', 10), attachmentController.uploadMedia);
router.get('/', checkPermission('view.media_library'), attachmentController.getAll);
router.get('/:id', checkPermission('view.media_library'), attachmentController.getById);
router.put('/:id', checkPermission('update.media_library'), attachmentController.update);
router.delete('/bulk', checkPermission('delete.media_library'), attachmentController.delete);

module.exports = router;
