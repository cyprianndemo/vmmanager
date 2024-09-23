const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    const token = jwt.sign({ _id: req.user._id.toString(), role: req.user.role }, process.env.JWT_SECRET);
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&role=${req.user.role}`);
  }
);

router.post('/google/callback', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name,
        email,
        role: 'Standard',  
      });
      await user.save();
    } else if (user.role === 'Guest') {
      user.role = 'Standard';
      await user.save();
    }

    const token = jwt.sign({ _id: user._id, role: user.role, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(400).json({ message: 'Invalid Google token', error: error.message });
  }
});

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  (req, res, next) => {
    passport.authenticate('github', (err, user, info) => {
      if (err) {
        console.error('GitHub authentication error:', err);
        return res.redirect('http://localhost:3000/login?error=github_auth_failed');
      }
      if (!user) {
        console.error('GitHub authentication failed:', info);
        return res.redirect('http://localhost:3000/login?error=github_auth_failed');
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect('http://localhost:3000/login?error=login_failed');
        }
        const token = jwt.sign({ _id: user._id.toString(), role: user.role }, process.env.JWT_SECRET);
        return res.redirect(`http://localhost:3000/oauth-success?token=${token}&role=${user.role}`);
      });
    })(req, res, next);
  }
);


module.exports = router;