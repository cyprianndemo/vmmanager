const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth.middleware');
const { generateQRCode, verify2FA } = require('../utils/2FA');
const adminAuth = require('../middleware/adminAuth.middleware');

router.post('/register', [
  check('username').not().isEmpty().withMessage('Username is required'),
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role, twoFactorAuth } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role, twoFactorAuth });

    if (twoFactorAuth) {
      const qrCodeUrl = generateQRCode(email);
      newUser.qrCodeUrl = qrCodeUrl;
    }

    await newUser.save();
    res.json({ message: 'User registered successfully', qrCodeUrl: newUser.qrCodeUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}); 


router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/profile', auth, [
  check('username').optional().not().isEmpty().withMessage('Username cannot be empty'),
  check('email').optional().isEmail().withMessage('Email is invalid'),
  check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password -tokens');
    console.log(users);
    res.json(users);
  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/subusers', async (req, res) => {
  try {
    const subusers = await User.find({ parentClient: req.user.id });
    res.json(subusers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.post('/subusers', auth, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      parentClient: req.user.id 
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.get('/sub-admin', async (req, res) => {
  try {
    const subusers = await User.find({ parentClient: req.user.id });
    res.json(subusers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});
router.post('/sub-admin', auth, async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      parentClient: req.user.id,
      role: role === 'Admin' ? 'Admin' : 'Standard' 
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.post('/suspend/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend admin users' });
    }

    user.suspended = true;
    await user.save();

    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


// Unsuspend a user
router.post('/unsuspend/:userId', adminAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.suspended = false; // Set the suspended field to false
    await user.save();

    res.json({ success: true, message: 'User unsuspended successfully' });
  } catch (error) {
    console.error('Error unsuspending user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
