const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Apply authentication and admin check to all routes
router.use(authenticate, isAdmin);

// ==================== DASHBOARD ROUTES ====================
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/growth', adminController.getGrowthData);

// ==================== USER MANAGEMENT ROUTES ====================
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId/status', adminController.updateUserStatus);

// ==================== GENERATOR MANAGEMENT ROUTES ====================
router.get('/generators', adminController.getAllGenerators);
router.get('/generators/:genId', adminController.getGeneratorDetails);
router.patch('/generators/:genId/status', adminController.updateGeneratorStatus);

// ==================== PAYMENT MANAGEMENT ROUTES ====================
router.get('/payments', adminController.getAllPayments);
router.get('/payments/stats', adminController.getPaymentStats);

// ==================== REPORTS & ANALYTICS ROUTES ====================
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/user-growth', adminController.getUserGrowthReport);

// ==================== SETTINGS ROUTES ====================
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;

