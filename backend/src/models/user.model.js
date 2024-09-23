const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, minlength: 6 },
  role: { type: String, enum: ['Admin', 'Standard', 'Guest'], default: 'Guest' },
  isAdmin: { type: Boolean, default: false },
  googleId: { type: String, unique: true, sparse: true },
  subscription: { 
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'RatePlan' }, 
    startDate: Date, 
    endDate: Date, 
    active: { type: Boolean, default: false }, 
    cancelledAt: Date 
  },
  parentClient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  suspended: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
