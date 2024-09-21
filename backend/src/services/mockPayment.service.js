const Payment = require('../models/payment.model');

const processPayment = async (userId, amount, description, paymentMethod, phoneNumber) => {
  // Simulate payment processing
  const isSuccessful = Math.random() < 0.9; // 90% success rate

  const payment = new Payment({
    user: userId,
    amount,
    description,
    status: isSuccessful ? 'Completed' : 'Failed',
    paymentMethod: phoneNumber ? 'MPESA' : 'Mock',
    phoneNumber: phoneNumber || undefined
  });

  await payment.save();

  return { 
    success: isSuccessful, 
    payment,
    transactionId: isSuccessful ? `MOCK-${Date.now()}-${Math.random().toString(36).substring(7)}` : null
  };
};

module.exports = { processPayment };
