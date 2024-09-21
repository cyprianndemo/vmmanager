// paymentService.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mockPaymentService = require('./mockPayment.service');

async function processPayment(userId, amount, description, paymentMethod, phoneNumber, cardDetails) {
  try {
    let paymentResult;
    const amountInCents = Math.round(amount * 100);

    console.log(`Processing payment for ${paymentMethod}. Amount: ${amountInCents}, Description: ${description}`);

    if (paymentMethod === 'Stripe') {
      // Use cardDetails for Stripe payments
      paymentResult = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method: {
          card: {
            number: cardDetails.cardNumber,
            exp_month: cardDetails.expiryDate.split('/')[0],
            exp_year: cardDetails.expiryDate.split('/')[1],
            cvc: cardDetails.cvv,
          },
        },
        confirm: true,
      });
      console.log('Stripe Payment Intent created:', paymentResult);
    } else if (paymentMethod === 'MPESA') {
      paymentResult = await mockPaymentService.processPayment(userId, amount, description, phoneNumber);
      console.log('MPESA payment result:', paymentResult);
    } else if (paymentMethod === 'PayPal') {
      paymentResult = await mockPaymentService.processPayment(userId, amount, description);
      console.log('PayPal payment result:', paymentResult);
    } else {
      throw new Error('Unsupported payment method');
    }

    if (paymentResult.success) {
      return {
        success: true,
        paymentResult
      };
    } else {
      throw new Error(paymentResult.message || 'Payment provider returned no result');
    }
  } catch (error) {
    console.error('Payment processing error:', error.message);
    return {
      success: false,
      message: error.message || 'An error occurred during payment processing'
    };
  }
}

module.exports = { processPayment };
