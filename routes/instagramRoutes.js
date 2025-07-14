const express = require("express");
const router = express.Router();
const {
  requireAuth,
  getIGAccount,
  getIGFeed,
  getFacebookPages,
  postIGComment,
  getIGComments,
  getIGCommentReplies
} = require('../controllers/instagramController');

router.get("/IGaccount", requireAuth, getIGAccount);
router.get("/IGfeed", requireAuth, getIGFeed);
// router.get("/pages", requireAuth, getFacebookPages);
router.post("/IG_meida_comment", postIGComment);
router.get("/Media_comments", requireAuth, getIGComments);
router.get("/Media_comment/replies", requireAuth, getIGCommentReplies);

module.exports = router;
