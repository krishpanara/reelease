const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.get('/linkedin/callback', socialController.getLinkedInCallback);
router.get('/twitter/callback', socialController.getTwitterCallback);
router.get('/youtube/callback', socialController.getYouTubeCallback);
router.get('/threads/callback', socialController.getThreadsCallback);

router.use(authenticate);

router.get('/facebook/config', checkPermission('view.channels'), socialController.getFacebookSDKConfig);
router.post('/facebook/connect', checkPermission('create.channels'), socialController.connectFacebookAccount);

router.get('/threads/config', checkPermission('view.channels'), socialController.getThreadsSDKConfig);
router.post('/threads/connect', checkPermission('create.channels'), socialController.connectThreadsAccount);

router.get('/linkedin/config', checkPermission('view.channels'), socialController.getLinkedInSDKConfig);
router.post('/linkedin/connect', checkPermission('create.channels'), socialController.connectLinkedInAccount);

router.get('/twitter/config', checkPermission('view.channels'), socialController.getTwitterSDKConfig);
router.post('/twitter/connect', checkPermission('create.channels'), socialController.connectTwitterAccount);

router.get('/youtube/config', checkPermission('view.channels'), socialController.getYouTubeSDKConfig);
router.post('/youtube/connect', checkPermission('create.channels'), socialController.connectYouTubeAccount);

router.get('/dashboard', checkPermission('view.channels'), socialController.getSocialDashboard);
router.get('/accounts', checkPermission('view.channels'), socialController.getConnectedAccounts);
router.get('/accounts/stats', checkPermission('view.channels'), socialController.getAccountsStats);
router.get('/account/:accountId', checkPermission('view.channels'), socialController.getAccountDetails);

router.delete('/account/:accountId', checkPermission('delete.channels'), socialController.disconnectAccount);
router.patch('/account/:accountId/pause', checkPermission('update.channels'), socialController.setAccountPaused);
router.post('/account/:accountId/validate', checkPermission('view.channels'), socialController.validateToken);

module.exports = router;