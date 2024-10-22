const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const RatePlan = require('../models/ratePlan.model');
const Payment = require('../models/payment.model'); 
const Subscription = require('../models/subscription.model');
const { processPayment } = require('../services/paymentService');
const PaymentMethodEnum = require('../models/paymentMethodEnum');
const { initiateSTKPush } = require('../services/mpesaService');

const generateMockPayments = (userId) => {
  return [
    {
      user: userId,
      amount: 20,
      ratePlan: 'Silver',
      status: 'Completed',
      description: 'Payment for silver plan',
      paymentMethod: PaymentMethodEnum.VISA, 
      phoneNumber: '1234567890',
      createdAt: new Date()
    },
    {
      user: userId,
      amount: 50,
      ratePlan: 'Gold',
      status: 'Completed',
      description: 'Payment for Gold plan',
      paymentMethod: PaymentMethodEnum.MASTERCARD, 
      phoneNumber: '0987654321',
      createdAt: new Date()
    }
  ];
};

const formatMPesaAmount = (amount) => {
  return Math.ceil(amount);
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
    const { planId, phoneNumber } = req.body;

    const ratePlan = await RatePlan.findById(planId);
    if (!ratePlan) {
      return res.status(400).json({ message: 'Invalid rate plan selected' });
    }

    const originalAmount = ratePlan.price;
    const mpesaAmount = formatMPesaAmount(originalAmount);

    const paymentMethod = PaymentMethodEnum.MPESA;  

    if (paymentMethod === PaymentMethodEnum.MPESA) {
      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      const formattedPhoneNumber = phoneNumber.startsWith('254') 
        ? phoneNumber 
        : `254${phoneNumber.replace(/^0+/, '')}`;

      try {
        const stkResponse = await initiateSTKPush({
          phoneNumber: formattedPhoneNumber,
          amount: mpesaAmount,
          accountReference: `Sub_${planId}`,
          transactionDesc: `Payment for ${ratePlan.name} subscription`
        });

        if (stkResponse.success) {
          const nextBillingDate = new Date();
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

          const newPayment = new Payment({
            user: req.user._id,
            amount: originalAmount,
            ratePlan: ratePlan.name,
            status: 'Pending',
            description: `Subscription: ${ratePlan.name}`,
            paymentMethod: PaymentMethodEnum.MPESA,
            phoneNumber: formattedPhoneNumber,
            mpesaRequestId: stkResponse.requestId
          });
          await newPayment.save();

          const subscription = new Subscription({
            user: req.user._id,
            plan: ratePlan._id, 
            planName: ratePlan.name, 
            price: originalAmount,
            maxVMs: ratePlan.maxVMs,
            maxBackups: ratePlan.maxBackups,
            nextBillingDate,
            status: 'Active'
          });
          await subscription.save();

          return res.status(200).json({
            message: 'STK Push sent successfully. Please complete the payment on your phone.',
            requestId: stkResponse.requestId,
            paymentId: newPayment._id
          });
        } else {
          throw new Error(stkResponse.message || 'STK Push failed');
        }
      } catch (mpesaError) {
        console.error('M-Pesa error:', mpesaError);
        return res.status(400).json({
          message: 'M-Pesa payment initiation failed',
          error: mpesaError.message
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid payment method selected' });
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
