const express = require('express');
const router = express.Router();
const subscriptionDAL = require('../../DAL/subscriptionDAL');
const userDAL = require('../../DAL/userDAL');
const generatorDAL = require('../../DAL/generatorDAL');
const { authenticate, authorize } = require('../middleware/auth');
const { verifyGeneratorOwnership, verifyOwnerHasGenerator } = require('../middleware/ownershipValidation');

// Get my subscriptions
router.get('/my', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const subscriptions = await subscriptionDAL.getByUserId(userId);

        res.json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscriptions'
        });
    }
});

// Subscribe to a generator (for regular users)
router.post('/subscribe', authenticate, async (req, res) => {
    try {
        const { generator_id, plan_id } = req.body;
        const userId = req.user.user_id;

        // Validate required fields
        if (!generator_id || !plan_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: generator_id and plan_id'
            });
        }

        // Check if user already has an active subscription
        const existingSubscriptions = await subscriptionDAL.getByUserId(userId);
        const anyActiveSubscription = existingSubscriptions.find(
            sub => sub.status === 'active'
        );

        if (anyActiveSubscription) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active subscription. Please cancel your current subscription before subscribing to a new generator.'
            });
        }

        // Create subscription with current date as start date
        const startDate = new Date().toISOString().split('T')[0];
        const subscriptionId = await subscriptionDAL.createSubscription({
            user_id: userId,
            generator_id: generator_id,
            plan_id: plan_id,
            start_date: startDate
        });

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: { subscription_id: subscriptionId }
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subscription'
        });
    }
});

// Get subscribers for a specific generator
router.get('/generator/:generatorId/subscribers', authenticate, authorize('owner', 'admin'), verifyGeneratorOwnership, async (req, res) => {
    try {
        const { generatorId } = req.params;
        const subscribers = await subscriptionDAL.getByGeneratorId(generatorId);

        // Add cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json({
            success: true,
            data: subscribers
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers'
        });
    }
});

// Get subscribers for owner's generator (first one - for backward compatibility)
router.get('/generator/subscribers', authenticate, authorize('owner', 'admin'), verifyOwnerHasGenerator, async (req, res) => {
    try {
        const ownerId = req.user.user_id;
        
        // Get owner's generator
        const generators = await generatorDAL.getByOwnerId(ownerId);
        if (!generators || generators.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        const generatorId = generators[0].generator_id;
        const subscribers = await subscriptionDAL.getByGeneratorId(generatorId);

        res.json({
            success: true,
            data: subscribers
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers'
        });
    }
});

// Add subscriber (owner only)
router.post('/', authenticate, authorize('owner', 'admin'), async (req, res) => {
    try {
        const { user_email, plan_id, start_date } = req.body;
        const ownerId = req.user.user_id;

        // Validate required fields
        if (!user_email || !plan_id || !start_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Find user by email
        const user = await userDAL.findByEmail(user_email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with that email'
            });
        }

        // Get owner's generator
        const generators = await generatorDAL.getByOwnerId(ownerId);
        if (!generators || generators.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No generator found for this owner'
            });
        }

        const generatorId = generators[0].generator_id;

        // Create subscription
        const subscriptionId = await subscriptionDAL.createSubscription({
            user_id: user.user_id,
            generator_id: generatorId,
            plan_id: plan_id,
            start_date: start_date
        });

        res.status(201).json({
            success: true,
            message: 'Subscriber added successfully',
            data: { subscription_id: subscriptionId }
        });
    } catch (error) {
        console.error('Add subscriber error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add subscriber'
        });
    }
});

// Change subscription plan (user can change their own plan)
router.put('/:subscriptionId/change-plan', authenticate, async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { plan_id } = req.body;
        const userId = req.user.user_id;

        if (!plan_id) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
        }

        // Get subscription to verify ownership
        const subscription = await subscriptionDAL.findById(subscriptionId);
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Check if user owns this subscription (or is owner/admin)
        if (subscription.user_id !== userId && req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this subscription'
            });
        }

        // Update the plan
        await subscriptionDAL.updateSubscription(subscriptionId, {
            plan_id: plan_id,
            status: subscription.status,
            end_date: subscription.end_date
        });

        res.json({
            success: true,
            message: 'Subscription plan updated successfully'
        });
    } catch (error) {
        console.error('Change plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change subscription plan'
        });
    }
});

// Cancel subscription (user can cancel their own, owner/admin can cancel any)
router.put('/:subscriptionId/cancel', authenticate, async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user.user_id;

        // Get subscription to verify ownership
        const subscription = await subscriptionDAL.findById(subscriptionId);
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Check if user owns this subscription (or is owner/admin)
        if (subscription.user_id !== userId && req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to cancel this subscription'
            });
        }

        await subscriptionDAL.cancelSubscription(subscriptionId);

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription'
        });
    }
});

module.exports = router;