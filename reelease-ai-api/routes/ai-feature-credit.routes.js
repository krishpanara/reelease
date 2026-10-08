const express = require('express');
const router = express.Router();
const aiFeatureCreditController = require('../controllers/ai-feature-credit.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.get('/provider/:providerId', aiFeatureCreditController.getCreditsByProvider);

router.post('/upsert', checkPermission('update.ai_providers'), aiFeatureCreditController.upsertCredit);
router.put('/:id', checkPermission('update.ai_providers'), aiFeatureCreditController.updateCredit);

router.delete('/:id', checkPermission('update.ai_providers'), aiFeatureCreditController.deleteCredit);

module.exports = router;
