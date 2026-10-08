const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.post('/generate', checkPermission('create.ai_generation'), aiController.generateMedia);

router.get('/usage-logs', checkPermission('view.ai_generation'), aiController.getUsageLogs);
router.post('/save-to-media', checkPermission('create.ai_generation'), aiController.saveToMedia);

module.exports = router;
