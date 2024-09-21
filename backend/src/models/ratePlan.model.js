const mongoose = require('mongoose');

const RatePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum']
  },
  price: {
    type: Number,
    required: true
  },
  maxVMs: {
    type: Number,
    required: true
  },
  maxBackups: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const RatePlan = mongoose.model('RatePlan', RatePlanSchema);

module.exports = RatePlan;