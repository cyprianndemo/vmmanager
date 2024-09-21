const Payment = require('../models/payment.model');

const checkPaymentStatus = async (req, res, next) => {
  try {
    const userPayments = await Payment.find({ user: req.user._id, status: 'Completed' });
    if (userPayments.length === 0) {
      return res.status(403).json({ message: 'Please complete a payment to access VM creation.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking payment status', error: error.message });
  }
};

module.exports = checkPaymentStatus;
