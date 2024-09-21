const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user.model');

function configurePassport(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName,
          role: 'Standard'
        });
        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/api/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the profile contains email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

    if (!email) {
      return done(null, false, { message: 'Email not provided by GitHub' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: profile.username,
        email: email,
        githubId: profile.id
      });
      await user.save();
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

module.exports = { configurePassport };
