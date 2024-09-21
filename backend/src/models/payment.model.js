const mongoose = require('mongoose'); // Import mongoose

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    ratePlan: { type: String, required: true }, 
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    description: { type: String, required: true },
    paymentMethod: { type: String, enum: ['Credit Card', 'MPESA', 'PayPal'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
