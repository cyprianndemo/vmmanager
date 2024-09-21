const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');

// Middleware to check if the user is an admin
router.use(auth, adminAuth);

// Get all payments
router.get('/payments', auth, adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'email');
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Get All Users (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password -tokens'); // Exclude sensitive fields
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Suspend or reactivate a user
router.post('/users/:userId/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.suspended) {
      await user.reactivate();
      res.json({ message: 'User reactivated successfully' });
    } else {
      await user.suspend();
      res.json({ message: 'User suspended successfully' });
    }
  } catch (error) {
    console.error('Error suspending/reactivating user:', error);
    res.status(500).json({ message: 'Error suspending/reactivating user' });
  }
});
router.get('/admin/payments', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const payments = await Payment.find().populate('user');
    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

router.post('/admin/suspend-user/:userId', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = true;
    await user.save();
    res.json({ message: 'User account suspended' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ message: 'Error suspending user' });
  }
});


module.exports = router;