const billDAL = require('../../DAL/billDAL');

class BillController {
    // Create bill
    async createBill(req, res) {
        try {
            const billData = req.body;
            const billId = await billDAL.createBill(billData);

            res.status(201).json({
                success: true,
                message: 'Bill created successfully',
                data: { billId }
            });
        } catch (error) {
            console.error('Create bill error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create bill'
            });
        }
    }

    // Get my bills
    async getMyBills(req, res) {
        try {
            const userId = req.user.user_id;
            const bills = await billDAL.getBillsByUserId(userId);

            res.json({
                success: true,
                data: bills
            });
        } catch (error) {
            console.error('Get bills error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch bills'
            });
        }
    }

    // Get pending bills
    async getPendingBills(req, res) {
        try {
            const userId = req.user.user_id;
            const bills = await billDAL.getPendingBillsByUserId(userId);

            res.json({
                success: true,
                data: bills
            });
        } catch (error) {
            console.error('Get pending bills error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch pending bills'
            });
        }
    }

    // Get bills by generator (owner)
    async getBillsByGenerator(req, res) {
        try {
            const { generatorId } = req.params;
            const bills = await billDAL.getBillsByGeneratorId(generatorId);

            res.json({
                success: true,
                data: bills
            });
        } catch (error) {
            console.error('Get generator bills error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch bills'
            });
        }
    }

    // Update bill status
    async updateBillStatus(req, res) {
        try {
            const { billId } = req.params;
            const { status } = req.body;

            await billDAL.updateBillStatus(billId, status);

            res.json({
                success: true,
                message: 'Bill status updated successfully'
            });
        } catch (error) {
            console.error('Update bill error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update bill'
            });
        }
    }

    // Generate bills for all subscribers of a generator
    async generateBills(req, res) {
        try {
            const { generatorId } = req.params;
            const subscriptionDAL = require('../../DAL/subscriptionDAL');
            
            // Get all active subscribers for this generator
            const subscribers = await subscriptionDAL.getByGeneratorId(generatorId);
            const activeSubscribers = subscribers.filter(s => s.status === 'active');
            
            if (activeSubscribers.length === 0) {
                return res.json({
                    success: true,
                    message: 'No active subscribers to generate bills for',
                    data: { billsCreated: 0 }
                });
            }
            
            // Generate bills for each subscriber
            const billsCreated = [];
            const billsSkipped = [];
            const billErrors = [];
            const currentDate = new Date();
            const periodStart = new Date();
            periodStart.setDate(1); // Start of current month
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            periodEnd.setDate(0); // Last day of current month
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 1);
            dueDate.setDate(5); // Due on 5th of next month
            
            // Get existing bills to check for duplicates
            const existingBills = await billDAL.getBillsByGeneratorId(generatorId);
            const currentMonthYear = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;
            
            for (const subscriber of activeSubscribers) {
                try {
                    // Check if bill already exists for this subscription in the current period
                    const existingBill = existingBills.find(bill => {
                        const billDateStr = bill.billing_period_start ? 
                            (typeof bill.billing_period_start === 'string' ? 
                                bill.billing_period_start : 
                                new Date(bill.billing_period_start).toISOString().split('T')[0]
                            ) : '';
                        
                        return bill.subscription_id === subscriber.subscription_id && billDateStr.startsWith(currentMonthYear);
                    });
                    
                    if (existingBill) {
                        billsSkipped.push(subscriber.user_name);
                        continue;
                    }
                    
                    const billId = await billDAL.createBill({
                        subscription_id: subscriber.subscription_id,
                        amount: subscriber.monthly_price,
                        billing_period_start: periodStart.toISOString().split('T')[0],
                        billing_period_end: periodEnd.toISOString().split('T')[0],
                        due_date: dueDate.toISOString().split('T')[0]
                    });
                    
                    billsCreated.push({ 
                        billId, 
                        subscriber: subscriber.user_name,
                        amount: subscriber.monthly_price 
                    });
                } catch (error) {
                    console.error('Error creating bill:', error);
                    billErrors.push(subscriber.user_name);
                }
            }
            
            let message = `Successfully generated ${billsCreated.length} bill(s)`;
            if (billsSkipped.length > 0) {
                message += `. Skipped ${billsSkipped.length} (already billed this month)`;
            }
            if (billErrors.length > 0) {
                message += `. Failed for ${billErrors.length} subscriber(s)`;
            }
            
            res.status(201).json({
                success: true,
                message: message,
                data: { 
                    billsCreated: billsCreated.length,
                    billsSkipped: billsSkipped.length,
                    billErrors: billErrors.length,
                    details: billsCreated
                }
            });
        } catch (error) {
            console.error('Generate bills error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate bills: ' + error.message
            });
        }
    }
}

module.exports = new BillController();