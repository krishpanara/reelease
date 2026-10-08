const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');
const subscriptionController = require('../controllers/subscription.controller');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

const receiptUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, receiptsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `receipt_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ok = allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase());
    if (ok) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: jpeg, jpg, png, gif, pdf'));
  },
});

router.use(authenticate);

router.get('/my-subscription', subscriptionController.getUserSubscription);
router.get('/my-subscription/payments', subscriptionController.getMyPaymentHistory);
router.post('/trial', subscriptionController.startTrial);
router.post('/create-stripe', subscriptionController.createStripeSubscription);
router.post('/create-razorpay', subscriptionController.createRazorpaySubscription);
router.post('/create-paypal', subscriptionController.createPayPalSubscription);
router.post(
  '/create-manual',
  receiptUpload.single('transaction_receipt'),
  subscriptionController.createManualSubscription
);
router.post('/confirm', subscriptionController.confirmSubscription);
router.post('/:id/cancel', subscriptionController.cancelSubscription);
router.post('/:id/resume', subscriptionController.resumeSubscription);
router.post('/:id/change-plan', subscriptionController.changeSubscriptionPlan);
router.post('/:id/renew', subscriptionController.renewSubscription);

router.get('/my', subscriptionController.getUserSubscription);
router.post('/stripe', subscriptionController.createStripeSubscription);
router.post('/razorpay', subscriptionController.createRazorpaySubscription);
router.post('/paypal', subscriptionController.createPayPalSubscription);
router.post('/manual', receiptUpload.single('transaction_receipt'), subscriptionController.createManualSubscription);

router.get('/', checkPermission('view.subscriptions'), subscriptionController.getAllSubscriptions);
router.get('/stats', checkPermission('view.subscriptions'), subscriptionController.getSubscriptionStats);
router.get('/payments', checkPermission('view.subscriptions'), subscriptionController.getSubscriptionPayments);
router.get('/pending-manual', checkPermission('view.subscriptions'), subscriptionController.getPendingManualSubscriptions);
router.post('/:id/approve-manual', checkPermission('update.subscriptions'), subscriptionController.approveManualSubscription);
router.post('/:id/reject-manual', checkPermission('update.subscriptions'), subscriptionController.rejectManualSubscription);
router.post('/assign', checkPermission('create.subscriptions'), subscriptionController.assignPlanToUser);

router.post('/:id/approve', checkPermission('update.subscriptions'), subscriptionController.approveManualSubscription);
router.post('/:id/reject', checkPermission('update.subscriptions'), subscriptionController.rejectManualSubscription);
router.post('/admin/grant', checkPermission('create.subscriptions'), subscriptionController.assignPlanToUser);

module.exports = router;
