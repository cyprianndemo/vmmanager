const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth.middleware');
const { generateQRCode, verify2FA } = require('../utils/2FA');
const adminAuth = require('../middleware/adminAuth.middleware');

// Registration Route
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

// Login Route
router.post('/login', [
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').exists().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile Route
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Users (Admin only)

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

// Create a new sub-user
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



module.exports = router;
