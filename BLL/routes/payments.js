const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

// User routes
router.post('/', authenticate, paymentController.createPayment);
router.get('/my', authenticate, paymentController.getMyPayments);

// Admin routes
router.get('/all', authenticate, authorize('admin'), paymentController.getAllPayments);

// Owner routes
router.get('/generator/:generatorId', authenticate, authorize('owner', 'admin'), paymentController.getPaymentsByGenerator);
router.get('/generator/:generatorId/stats', authenticate, authorize('owner', 'admin'), paymentController.getPaymentStats);

module.exports = router;