const express = require('express');
const router = express.Router();
const characterController = require('../controllers/character.controller');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

router.use(authenticate);

router.post('/generate', checkPermission('create.characters'), characterController.generateCharacter);
router.get('/', checkPermission('view.characters'), characterController.getCharacters);
router.get('/:id', checkPermission('view.characters'), characterController.getCharacter);
router.put('/:id', checkPermission('update.characters'), characterController.updateCharacter);
router.delete('/:id', checkPermission('delete.characters'), characterController.deleteCharacter);

module.exports = router;
