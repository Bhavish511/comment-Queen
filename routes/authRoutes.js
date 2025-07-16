const express = require("express");
const router = express.Router();
const passport = require('passport');

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: [
      "business_management",
      "instagram_basic",
      "instagram_manage_comments",
      "instagram_manage_insights",
      "instagram_content_publish",
      "pages_read_engagement",
      "pages_show_list",
      "page_events",
      "pages_read_user_content",
      "pages_read_engagement",
      "pages_manage_posts"
    ],
  })
);

router.get("/facebook/callbacks", passport.authenticate("facebook", { session: true }), (req, res) => {
  if (!req.user?.accessToken) {
    return res.status(401).json({ error: "Authentication failed or token missing" });
  }
  console.log("User authenticated:", req.user);
  console.log("Session before save:", req.session);

  // This is already the long-lived token
  req.session.tokens = {
    accessToken: req.user.accessToken,
    expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000 // 60 days
  };

  req.session.save(err => {
    if (err) {
      console.error("Session save error:", err);
      return res.status(500).json({ error: "Session error" });
    }

    res.status(200).json({
      message: "Facebook login successful",
      access_token: req.user.accessToken,
      profile: req.user
    });
  });
});
module.exports = router;
