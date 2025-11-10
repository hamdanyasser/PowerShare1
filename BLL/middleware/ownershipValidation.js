const generatorDAL = require('../../DAL/generatorDAL');

/**
 * Middleware to verify that the authenticated user owns the generator specified in params
 * Admins bypass this check and can access all generators
 */
async function verifyGeneratorOwnership(req, res, next) {
    try {
        const { generatorId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role;

        // Admins can access all generators
        if (userRole === 'admin') {
            return next();
        }

        // Validate generatorId is provided
        if (!generatorId) {
            return res.status(400).json({
                success: false,
                message: 'Generator ID is required'
            });
        }

        // Get generator from database
        const generator = await generatorDAL.findById(generatorId);

        // Check if generator exists
        if (!generator) {
            return res.status(404).json({
                success: false,
                message: 'Generator not found'
            });
        }

        // Verify ownership
        if (generator.owner_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not own this generator.'
            });
        }

        // Owner verified, allow access
        next();
    } catch (error) {
        console.error('Ownership validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify generator ownership'
        });
    }
}

/**
 * Middleware to verify ownership for routes that don't have generatorId in params
 * but use owner's first generator (backward compatibility route)
 */
async function verifyOwnerHasGenerator(req, res, next) {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role;

        // Admins bypass this check
        if (userRole === 'admin') {
            return next();
        }

        // Get owner's generators
        const generators = await generatorDAL.getByOwnerId(userId);

        // Check if owner has at least one generator
        if (!generators || generators.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No generator found for this owner. Please create a generator first.'
            });
        }

        // Attach first generator ID to request for backward compatibility
        req.ownerGeneratorId = generators[0].generator_id;
        next();
    } catch (error) {
        console.error('Owner generator check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify generator ownership'
        });
    }
}

module.exports = {
    verifyGeneratorOwnership,
    verifyOwnerHasGenerator
};
