const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const RatePlan = require('../models/ratePlan.model');
const Payment = require('../models/payment.model');
const Subscription = require('../models/subscription.model');
const { processPayment } = require('../services/paymentService');

const generateMockPayments = (userId) => {
  return [
    {
      user: userId,
      amount: 20,
      ratePlan: 'Silver',
      status: 'Completed',
      description: 'Payment for silver plan',
      paymentMethod: 'Visa',
      phoneNumber: '1234567890',
      createdAt: new Date()
    },
    {
      user: userId,
      amount: 50,
      ratePlan: 'Gold',
      status: 'Completed',
      description: 'Payment for Gold plan',
      paymentMethod: 'Mastercard',
      phoneNumber: '0987654321',
      createdAt: new Date()
    }
  ];
};
router.get('/history', async (req, res) => {
  try {
    const userId = req.user._id;
    const realPayments = await Payment.find({ user: userId });

    const mockPayments = generateMockPayments(userId);
    const allPayments = [...realPayments, ...mockPayments];

    res.status(200).json(allPayments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      message: 'Error fetching payment history',
      error: error.message
    });
  }
});

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId, paymentMethod, cardNumber, expiryDate, cvv, phoneNumber, testMode } = req.body;

    // Fetch the selected rate plan
    const ratePlan = await RatePlan.findById(planId);
    if (!ratePlan) {
      return res.status(400).json({ message: 'Invalid rate plan selected' });
    }

    const amount = ratePlan.price;

    // Simulate payment success in test mode
    let paymentResult;
    if (testMode) {
      paymentResult = { success: true };  // Payment always succeeds in Test Mode
    } else {
      paymentResult = await processPayment(
        req.user._id, 
        amount, 
        `Subscription: ${ratePlan.name}`, 
        paymentMethod, 
        phoneNumber, 
        { cardNumber, expiryDate, cvv }
      );
    }

    if (paymentResult.success) {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1); // Add 1 month for next billing

      // Save the payment information
      const newPayment = new Payment({
        user: req.user._id,
        amount: ratePlan.price,
        ratePlan: ratePlan.name,
        status: 'Completed',
        description: `Subscription: ${ratePlan.name}`,
        paymentMethod,
        phoneNumber: phoneNumber || undefined
      });
      await newPayment.save();

      // Create a new subscription
      const subscription = new Subscription({
        user: req.user._id,
        plan: ratePlan.name,
        price: ratePlan.price,
        maxVMs: ratePlan.maxVMs,
        maxBackups: ratePlan.maxBackups,
        nextBillingDate
      });
      await subscription.save();

      res.status(200).json({
        message: 'Subscription successful',
        subscription,
        payment: newPayment
      });
    } else {
      res.status(400).json({
        message: 'Payment failed',
        error: paymentResult.message
      });
    }
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      message: 'Error processing subscription',
      error: error.message
    });
  }
});

module.exports = router;
