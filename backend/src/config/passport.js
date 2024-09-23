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
      let user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // If user exists, update role to Standard if it's currently Guest
        if (user.role === 'Guest') {
          user.role = 'Standard';
          await user.save();
        }
        return done(null, user);
      } else {
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName,
          role: 'Standard'  // Set role to Standard for new Google users
        });
        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      console.error('Error in Google strategy:', error);
      return done(error, null);
    }
  }));

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/github/callback",
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub profile:', JSON.stringify(profile, null, 2));
      
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (!email) {
        console.error('No email provided by GitHub');
        return done(null, false, { message: 'Email not provided by GitHub' });
      }
      
      let user = await User.findOne({ email });
      
      if (!user) {
        user = new User({
          username: profile.username,
          email: email,
          githubId: profile.id,
          role: 'Standard'  // Set role to Standard for new GitHub users
        });
        await user.save();
      } else if (user.role === 'Guest') {
        // If user exists but is a Guest, update to Standard
        user.role = 'Standard';
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error in GitHub strategy:', error);
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

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