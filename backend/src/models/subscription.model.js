const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  plan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RatePlan', 
    required: true 
  },
  planName: { 
    type: String, 
    required: true 
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
  status: { 
    type: String,
    enum: ['Active', 'Expired', 'Cancelled'],
    default: 'Active'
  },
  startDate: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  nextBillingDate: { 
    type: Date, 
    required: true 
  },
  cancelledAt: { 
    type: Date 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

SubscriptionSchema.methods.cancel = function() {
  this.status = 'Cancelled';
  this.active = false;
  this.cancelledAt = new Date();
  return this.save();
};

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
