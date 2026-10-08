const express = require('express');
const router = express.Router();
const landingPageController = require('../controllers/landing-page.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.get('/', landingPageController.getLandingPage);
router.put('/', authenticate, checkPermission('update.settings'), landingPageController.updateLandingPage);

module.exports = router;
