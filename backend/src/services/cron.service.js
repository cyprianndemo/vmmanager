const cron = require('node-cron');
const Subscription = require('../models/subscription.model');
const { processPayment } = require('./mockPayment.service');

cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const subscriptions = await Subscription.find({ nextBillingDate: { $lte: now }, status: 'Active' });
  
  subscriptions.forEach(async (subscription) => {
    const amount = subscription.plan === 'Pro' ? 50 : 20;
    const result = await processPayment(subscription.user, amount, `Recurring Payment: ${subscription.plan}`);
    
    if (result.success) {
      subscription.nextBillingDate.setMonth(subscription.nextBillingDate.getMonth() + 1);
      await subscription.save();
    } else {
      subscription.status = 'Expired';
      await subscription.save();
    }
  });
});
