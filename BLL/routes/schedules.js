const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleControllers');
const scheduleDAL = require('../../DAL/scheduleDAL');
const { authenticate, authorize } = require('../middleware/auth');

// IMPORTANT: Specific routes MUST come before parameterized routes
// Get schedules for logged-in owner's generator
router.get('/my', authenticate, authorize('owner', 'admin'), async (req, res) => {
    try {
        const ownerId = req.user.user_id;
        const generatorDAL = require('../../DAL/generatorDAL');
        
        // Get owner's generator
        const generators = await generatorDAL.getByOwnerId(ownerId);
        if (!generators || generators.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        const generatorId = generators[0].generator_id;
        
        // Get ALL schedules for the owner (not just upcoming)
        const schedules = await scheduleDAL.getAllSchedulesByGenerator(generatorId);
        
        res.json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Get my schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedules'
        });
    }
});

// Owner routes (create, update, delete)
router.post('/', authenticate, authorize('owner', 'admin'), scheduleController.createSchedule);
router.post('/bulk', authenticate, authorize('owner', 'admin'), scheduleController.bulkCreateSchedules);
router.put('/:scheduleId', authenticate, authorize('owner', 'admin'), scheduleController.updateSchedule);
router.delete('/:scheduleId', authenticate, authorize('owner', 'admin'), scheduleController.deleteSchedule);

// Get next outage for logged-in user's generator
router.get('/my/next', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const subscriptionDAL = require('../../DAL/subscriptionDAL');
        
        // Get user's active subscription
        const subscriptions = await subscriptionDAL.getByUserId(userId);
        if (!subscriptions || subscriptions.length === 0) {
            return res.json({
                success: true,
                data: null
            });
        }
        
        const generatorId = subscriptions[0].generator_id;
        
        // Get next outage
        const schedules = await scheduleDAL.getUpcomingSchedules(generatorId, 1);
        
        res.json({
            success: true,
            data: schedules && schedules.length > 0 ? schedules[0] : null
        });
    } catch (error) {
        console.error('Get next outage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch next outage'
        });
    }
});

// Public/User routes - MUST be last (they have parameters)
router.get('/:generatorId/today', scheduleController.getTodaySchedules);
router.get('/:generatorId/upcoming', scheduleController.getUpcomingSchedules);
router.get('/:generatorId', scheduleController.getSchedulesByDateRange);

module.exports = router;