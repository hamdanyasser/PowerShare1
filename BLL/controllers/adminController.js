const adminDAL = require('../../DAL/adminDAL');
const userDAL = require('../../DAL/userDal');
const generatorDAL = require('../../DAL/generatorDAL');
const paymentDAL = require('../../DAL/paymentDAL');
const billDAL = require('../../DAL/billDAL');
const settingsDAL = require('../../DAL/settingsDAL');

class AdminController {
    // ==================== DASHBOARD ====================
    
    // Get dashboard overview statistics
    async getDashboardStats(req, res) {
        try {
            const overview = await adminDAL.getDashboardOverview();
            const userTypes = await adminDAL.getUserTypeDistribution();
            
            res.json({
                success: true,
                data: {
                    overview,
                    user_types: userTypes
                }
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics'
            });
        }
    }

    // Get growth data for charts
    async getGrowthData(req, res) {
        try {
            const months = parseInt(req.query.months) || 12;
            
            const userGrowth = await adminDAL.getUserGrowthStats(months);
            const ownerGrowth = await adminDAL.getGeneratorOwnerGrowthStats(months);
            
            // Format data for Chart.js
            const labels = [];
            const userCounts = [];
            const ownerCounts = [];
            
            // Create a complete month range
            const monthsArray = [];
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toISOString().slice(0, 7);
                monthsArray.push({
                    key: monthKey,
                    label: date.toLocaleDateString('en-US', { month: 'short' })
                });
            }
            
            // Map data to months
            const userMap = new Map(userGrowth.map(row => [row.month, row.user_count]));
            const ownerMap = new Map(ownerGrowth.map(row => [row.month, row.owner_count]));
            
            let cumulativeUsers = 0;
            let cumulativeOwners = 0;
            
            monthsArray.forEach(({ key, label }) => {
                labels.push(label);
                cumulativeUsers += userMap.get(key) || 0;
                cumulativeOwners += ownerMap.get(key) || 0;
                userCounts.push(cumulativeUsers);
                ownerCounts.push(cumulativeOwners);
            });
            
            res.json({
                success: true,
                data: {
                    labels,
                    users: userCounts,
                    owners: ownerCounts
                }
            });
        } catch (error) {
            console.error('Get growth data error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch growth data'
            });
        }
    }

    // ==================== USER MANAGEMENT ====================
    
    // Get all users
    async getAllUsers(req, res) {
        try {
            const users = await adminDAL.getAllUsersWithStats();
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    }

    // Get user details
    async getUserDetails(req, res) {
        try {
            const userId = req.params.userId;
            const userDetails = await adminDAL.getUserDetailById(userId);
            
            if (!userDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: userDetails
            });
        } catch (error) {
            console.error('Get user details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user details'
            });
        }
    }

    // Update user status
    async updateUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const { status } = req.body;

            // Validate status value
            const validStatuses = ['active', 'suspended', 'inactive'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be: active, suspended, or inactive'
                });
            }

            // Update user status
            await userDAL.updateUser(userId, { status });

            res.json({
                success: true,
                message: 'User status updated successfully'
            });
        } catch (error) {
            console.error('Update user status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status'
            });
        }
    }

    // ==================== GENERATOR MANAGEMENT ====================
    
    // Get all generators
    async getAllGenerators(req, res) {
        try {
            const generators = await adminDAL.getAllGeneratorsWithStats();
            
            res.json({
                success: true,
                data: generators
            });
        } catch (error) {
            console.error('Get all generators error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch generators'
            });
        }
    }

    // Get generator details
    async getGeneratorDetails(req, res) {
        try {
            const genId = req.params.genId;
            const genDetails = await adminDAL.getGeneratorDetailById(genId);
            
            if (!genDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Generator not found'
                });
            }
            
            res.json({
                success: true,
                data: genDetails
            });
        } catch (error) {
            console.error('Get generator details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch generator details'
            });
        }
    }

    // Update generator status
    async updateGeneratorStatus(req, res) {
        try {
            const { genId } = req.params;
            const { status } = req.body;
            
            await generatorDAL.updateGenerator(genId, { status });
            
            res.json({
                success: true,
                message: 'Generator status updated successfully'
            });
        } catch (error) {
            console.error('Update generator status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update generator status'
            });
        }
    }

    // ==================== PAYMENT MANAGEMENT ====================
    
    // Get all payments
    async getAllPayments(req, res) {
        try {
            const payments = await adminDAL.getAllPaymentsWithDetails();
            
            res.json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Get all payments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payments'
            });
        }
    }

    // Get payment statistics
    async getPaymentStats(req, res) {
        try {
            const stats = await adminDAL.getPaymentStatistics();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get payment stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payment statistics'
            });
        }
    }

    // ==================== REPORTS & ANALYTICS ====================
    
    // Get revenue report
    async getRevenueReport(req, res) {
        try {
            const months = parseInt(req.query.months) || 12;
            const revenueData = await adminDAL.getRevenueByMonth(months);
            
            // Format data for Chart.js
            const labels = [];
            const revenues = [];
            
            // Create a complete month range
            const monthsArray = [];
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toISOString().slice(0, 7);
                monthsArray.push({
                    key: monthKey,
                    label: date.toLocaleDateString('en-US', { month: 'short' })
                });
            }
            
            // Map revenue data
            const revenueMap = new Map(revenueData.map(row => [row.month, parseFloat(row.revenue)]));
            
            monthsArray.forEach(({ key, label }) => {
                labels.push(label);
                revenues.push(revenueMap.get(key) || 0);
            });
            
            res.json({
                success: true,
                data: {
                    labels,
                    revenues
                }
            });
        } catch (error) {
            console.error('Get revenue report error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch revenue report'
            });
        }
    }

    // Get user growth report
    async getUserGrowthReport(req, res) {
        try {
            const months = parseInt(req.query.months) || 12;
            const growthData = await adminDAL.getUserGrowthStats(months);
            
            // Format data for Chart.js
            const labels = [];
            const newUsers = [];
            
            // Create a complete month range
            const monthsArray = [];
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toISOString().slice(0, 7);
                monthsArray.push({
                    key: monthKey,
                    label: date.toLocaleDateString('en-US', { month: 'short' })
                });
            }
            
            // Map growth data
            const growthMap = new Map(growthData.map(row => [row.month, row.user_count]));
            
            monthsArray.forEach(({ key, label }) => {
                labels.push(label);
                newUsers.push(growthMap.get(key) || 0);
            });
            
            res.json({
                success: true,
                data: {
                    labels,
                    new_users: newUsers
                }
            });
        } catch (error) {
            console.error('Get user growth report error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user growth report'
            });
        }
    }

    // ==================== SYSTEM SETTINGS ====================
    
    // Get system settings
    async getSettings(req, res) {
        try {
            let settings = await settingsDAL.getAllSettings();
            
            // Convert string booleans to actual booleans for certain fields
            if (settings) {
                settings.email_notifications = settings.email_notifications === 'true';
                settings.sms_notifications = settings.sms_notifications === 'true';
                settings.maintenance_mode = settings.maintenance_mode === 'true';
            }
            
            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Get settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch settings'
            });
        }
    }

    // Update system settings
    async updateSettings(req, res) {
        try {
            const settings = req.body;
            
            // Convert booleans to strings for storage
            const settingsToStore = {};
            for (const [key, value] of Object.entries(settings)) {
                settingsToStore[key] = typeof value === 'boolean' ? value.toString() : value;
            }
            
            await settingsDAL.updateSettings(settingsToStore);
            
            res.json({
                success: true,
                message: 'Settings updated successfully',
                data: settings
            });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update settings'
            });
        }
    }
}

module.exports = new AdminController();

