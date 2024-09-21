const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const RatePlan = require('../models/ratePlan.model');
const Subscription = require('../models/subscription.model');


router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = req.user;
    const ratePlan = await RatePlan.findById(planId);

    if (!ratePlan) {
      return res.status(400).json({ message: 'Invalid rate plan selected' });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        plan: ratePlan._id,
        planName: ratePlan.name,
        price: ratePlan.price,
        maxVMs: ratePlan.maxVMs,
        maxBackups: ratePlan.maxBackups,
        startDate: new Date(),
        nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'Active',
        active: true
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error processing subscription',
      error: error.message
    });
  }
});

router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id }).populate('plan');
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
});


router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    await subscription.cancel();
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription', error: error.message });
  }
});

module.exports = router;
