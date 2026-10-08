const express = require('express');
const router = express.Router();
const captionController = require('../controllers/caption.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.get('/', checkPermission('view.captions'), captionController.getCaptions);
router.get('/:id', checkPermission('view.captions'), captionController.getCaptionById);
router.post('/', checkPermission('create.captions'), captionController.createCaption);
router.put('/:id', checkPermission('update.captions'), captionController.updateCaption);
router.delete('/:id', checkPermission('delete.captions'), captionController.deleteCaption);

module.exports = router;
