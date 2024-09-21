const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  // Handle success
  const token = req.user.token;
  res.redirect(`http://localhost:3000/login?token=${token}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
  // Handle success
  const token = req.user.token;
  res.redirect(`http://localhost:3000/login?token=${token}`);
});

module.exports = router;
