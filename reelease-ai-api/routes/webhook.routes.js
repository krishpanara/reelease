const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.stripeWebhook);
router.post('/razorpay', webhookController.razorpayWebhook);
router.post('/paypal', webhookController.paypalWebhook);

module.exports = router;
