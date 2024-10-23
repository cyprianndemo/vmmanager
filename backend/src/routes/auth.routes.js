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

    if (user.suspended) {
      return res.status(403).json({ 
        message: 'Your account has been suspended. Please contact the administrator for assistance.',
        suspended: true 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return res.json({ 
      token, 
      role: user.role,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
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
    const token = jwt.sign({ _id: req.user._id.toString(), role: req.user.role, email: req.user.email}, process.env.JWT_SECRET);
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&role=${req.user.role}`);
  }
);

router.post('/google/callback', async (req, res) => {
  const { credential, code } = req.body;
  try {
    let payload;
    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else if (code) {
      const { tokens } = await googleClient.getToken(code);
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      throw new Error('No valid Google authentication data provided');
    }

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
    console.error('Google authentication error:', error);
    res.status(400).json({ message: 'Invalid Google authentication', error: error.message });
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
        const token = jwt.sign({ _id: user._id.toString(), role: user.role, email: user.email }, process.env.JWT_SECRET);
        return res.redirect(`http://localhost:3000/oauth-success?token=${token}&role=${user.role}`);
      });
    })(req, res, next);
  }
);
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing your request' });
  }
});

module.exports = router;