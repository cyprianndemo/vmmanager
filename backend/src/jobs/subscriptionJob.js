const cron = require('node-cron');
const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');

const handleExpiredSubscriptions = async () => {
    const now = new Date();
    const expiredSubscriptions = await Subscription.find({
      active: true,
      status: 'Active',
      nextBillingDate: { $lt: now }
    }).populate('user');
  
    for (const subscription of expiredSubscriptions) {
      subscription.status = 'Expired';
      subscription.active = false;
      await subscription.save();
  
      // Here you might want to send an email to the user about their expired subscription
      console.log(`Subscription expired for user: ${subscription.user.email}`);
    }
  };

// Run the job every day at midnight
cron.schedule('0 0 * * *', handleExpiredSubscriptions);

module.exports = { handleExpiredSubscriptions };