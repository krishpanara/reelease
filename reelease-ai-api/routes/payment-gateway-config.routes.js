const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');
const gatewayConfigController = require('../controllers/payment-gateway-config.controller');

router.get('/enabled', gatewayConfigController.getEnabledGateways);

router.use(authenticate);

router.get('/webhook-urls', checkPermission('view.payment_setup'), gatewayConfigController.getWebhookUrls);
router.put('/trial-settings', checkPermission('update.payment_setup'), gatewayConfigController.updateTrialSettings);
router.get('/transactions', checkPermission('view.transactions'), gatewayConfigController.getTransactions);

router.get('/', checkPermission('view.payment_setup'), gatewayConfigController.getGateways);
router.post('/', checkPermission('update.payment_setup'), gatewayConfigController.createGateway);

router.get('/:name', checkPermission('view.payment_setup'), gatewayConfigController.getGatewayConfigByName);
router.put('/:gateway_name', checkPermission('update.payment_setup'), gatewayConfigController.updateGateway);
router.patch('/:name/toggle', checkPermission('update.payment_setup'), gatewayConfigController.toggleGatewayStatus);
router.delete('/:name', checkPermission('update.payment_setup'), gatewayConfigController.deleteGateway);
router.post('/:name/test', checkPermission('update.payment_setup'), gatewayConfigController.testGateway);
router.post('/:name/reregister-webhook', checkPermission('update.payment_setup'), gatewayConfigController.reregisterWebhook);

module.exports = router;