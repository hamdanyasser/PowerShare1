const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', generatorController.getAllGenerators);
router.get('/:generatorId', generatorController.getGeneratorById);

// Owner routes - only owners can create generators
router.post('/', authenticate, authorize('owner'), generatorController.createGenerator);
router.get('/my/generators', authenticate, authorize('owner'), generatorController.getMyGenerators);

// Both owners and admins can update, delete, and view stats
router.put('/:generatorId', authenticate, authorize('owner', 'admin'), generatorController.updateGenerator);
router.delete('/:generatorId', authenticate, authorize('owner', 'admin'), generatorController.deleteGenerator);
router.get('/:generatorId/stats', authenticate, authorize('owner', 'admin'), generatorController.getGeneratorStats);

module.exports = router;