const express = require("express");
const router = express.Router();
const { requireAuth, getUserInfo, getFacebookPages,getpagefeed,
    getpostcomments,
    post_comment,
    post_comment_reply,
    post_comment_replies } = require('../controllers/facebookController');

router.get("/user-info", requireAuth, getUserInfo);
router.get("/pages", requireAuth, getFacebookPages);
router.get("/page/feed",requireAuth,getpagefeed);
router.get("/post/comments",requireAuth,getpostcomments);
router.post("/post/comment",post_comment);
router.post("/post/comments/reply",post_comment_reply);
router.get("/post/comment/replies",requireAuth,post_comment_replies);

module.exports = router;
