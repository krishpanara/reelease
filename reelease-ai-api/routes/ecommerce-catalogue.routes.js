const express = require('express');
const router = express.Router();
const ecController = require('../controllers/ecommerce-catalogue.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.post('/generate', checkPermission('create.ecommerce_catalogue'), ecController.generateCatalogueVideo);
router.get('/list', checkPermission('view.ecommerce_catalogue'), ecController.getCatalogueVideos);
router.delete('/:id', checkPermission('delete.ecommerce_catalogue'), ecController.deleteCatalogueVideo);

module.exports = router;
