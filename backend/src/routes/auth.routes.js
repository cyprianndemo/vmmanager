const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const passport = require('passport'); 


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

  
    const token = jwt.sign({ _id: user._id, role: user.role, email}, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token, role: user.role });

  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});


router.post('/register', async (req, res) => {
  const { username, email, password, role, twoFactorAuth } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'Guest',
    });

    if (twoFactorAuth) {
      const secret = speakeasy.generateSecret();
      newUser.twoFactorSecret = secret.base32; 

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      await newUser.save();

      return res.json({ message: 'User registered successfully. 2FA is enabled.', qrCodeUrl });
    } else {
      await newUser.save();
      return res.json({ message: 'User registered successfully.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});


router.get('http://localhost:5000/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ _id: req.user._id.toString(), role: req.user.role }, process.env.JWT_SECRET);
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&role=${req.user.role}`);
  }
);


router.get('http://localhost:5000/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ _id: req.user._id.toString(), role: req.user.role }, process.env.JWT_SECRET);
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&role=${req.user.role}`);
  }
);

module.exports = router;
