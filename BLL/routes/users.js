const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get('/all', authenticate, authorize('admin'), userController.getAllUsers);

// Get user by ID
router.get('/:userId', authenticate, userController.getUserById);

// Update user profile
router.put('/profile', authenticate, upload.single('profile_image'), userController.updateProfile);

// Update user preferences (legacy - keep for backward compatibility)
router.put('/preferences', authenticate, userController.updatePreferences);

// Get notification preferences
router.get('/settings/notifications', authenticate, userController.getNotificationPreferences);

// Update notification preferences
router.put('/settings/notifications', authenticate, userController.updateNotificationPreferences);

module.exports = router;