const Subscription = require('../models/subscription.model');
const VM = require('../models/vm.model');
const checkVMLimits = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'Active' });
    if (!subscription) {
      return res.status(403).json({ message: 'No active subscription found' });
    }

    const vmCount = await VM.countDocuments({ user: req.user._id });
    if (vmCount >= subscription.maxVMs) {
      return res.status(403).json({ message: `VM limit reached: Your plan (${subscription.plan}) allows up to ${subscription.maxVMs} VMs` });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking VM limits', error: error.message });
  }
};

module.exports = checkVMLimits;
