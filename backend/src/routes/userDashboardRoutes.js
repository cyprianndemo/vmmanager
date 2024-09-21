const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Subscription = require('../models/subscription.model');
const Payment = require('../models/payment.model');
const VM = require('../models/vm.model');
//const Backup = require('../models/backup.model');

router.get('/subscription', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, active: true });
    if (!subscription) {
      return res.json(null);
    }

    const vms = await VM.countDocuments({ user: req.user._id });
    const backups = await Backup.countDocuments({ user: req.user._id });

    res.json({
      ...subscription.toObject(),
      usedVMs: vms,
      usedBackups: backups
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

router.get('/payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

router.post('/subscription/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, active: true });
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.active = false;
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

module.exports = router;