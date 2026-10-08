const express = require('express');
const router = express.Router();
const socialPublishController = require('../controllers/social-publish.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.post('/', checkPermission('create.social_post'), socialPublishController.publishContent);
router.post('/bulk', checkPermission('create.social_post'), socialPublishController.bulkPublish);
router.post('/generate-caption', checkPermission('create.social_post'), socialPublishController.generateCaption);
router.post('/cancel-scheduled/:historyId', checkPermission('update.social_post'), socialPublishController.cancelScheduledPost);
router.post('/validate-media', checkPermission('create.social_post'), socialPublishController.validateMedia);

router.post('/drafts', checkPermission('create.social_post'), socialPublishController.saveDraft);
router.get('/drafts', checkPermission('view.social_post'), socialPublishController.getDrafts);
router.get('/drafts/:draftId', checkPermission('view.social_post'), socialPublishController.getDraftById);
router.put('/drafts/:draftId', checkPermission('update.social_post'), socialPublishController.updateDraft);
router.delete('/drafts/:draftId', checkPermission('delete.social_post'), socialPublishController.deleteDraft);

router.get('/supported-platforms', checkPermission('view.social_post'), socialPublishController.getSupportedPlatforms);
router.get('/history', checkPermission('view.social_post'), socialPublishController.getPostHistory);
router.get('/history/:historyId', checkPermission('view.social_post'), socialPublishController.getPostById);
router.delete('/history/:historyId', checkPermission('delete.social_post'), socialPublishController.deletePost);

module.exports = router;