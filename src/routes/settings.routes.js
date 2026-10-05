const express = require('express');
const controller = require('../controllers/settings.controller');

const router = express.Router();

router.get('/:userId', controller.getSettings);
router.post('/', controller.createSettings);
router.put('/:userId', controller.updateSettings);
router.delete('/:userId', controller.deleteSettings);

module.exports = router;