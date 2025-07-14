const FacebookStrategy = require('passport-facebook').Strategy;
const { extendUserAccessToken } = require('../services/graphApi');

module.exports = (passport) => {
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((obj, cb) => cb(null, obj));

  passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL,
    profileFields: ["id", "displayName"],
    authorizationURL: "https://www.facebook.com/v23.0/dialog/oauth",
    tokenURL: "https://graph.facebook.com/v23.0/oauth/access_token",
    enableProof: true,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const longLivedUserToken = await extendUserAccessToken(accessToken);
      profile.accessToken = longLivedUserToken;
      return done(null, profile);
    } catch (err) {
      console.error("Error extending access token:", err.message);
      return done(err);
    }
  }));
};
