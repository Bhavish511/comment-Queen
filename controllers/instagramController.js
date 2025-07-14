const { callGraphAPI } = require('../services/graphApi');
const sharedstate = require('../utils/sharedstate');
// const {getPageToken,getPageId} = require('../utils/sharedstate');

// const page_token = getPageToken();
// const page_id = getPageId();

// console.log("Page Token:", page_token);
// console.log("Page ID:", page_id);
let ig_id;
let media_ids = [];
let media_comment_ids = [];

const requireAuth = (req, res, next) => {
  const tokens = req.session.tokens;

  if (!tokens || !tokens.accessToken) {
    console.log("No access token found in session");
    return res.redirect("/auth/facebook");
  }

  const now = Date.now();
  const bufferTime = 10 * 60 * 1000; // 10 minutes early buffer

  if (tokens.expiresAt && now > tokens.expiresAt - bufferTime) {
    console.log("Access token expired or about to expire");
    return res.redirect("/auth/facebook");
  }

  next();
};

const getIGAccount = async (req, res) => {
  const page_id = sharedstate.getPageId();
  // console.log();
  const page_token = sharedstate.getPageToken();
  console.log("pageid: ", page_id);
  console.log("pagetoken: ", page_token);
  
  // console.log(page_id);
  // console.log(page_token);
  
  if (!page_id) return res.status(401).json({ error: "User not authenticated Or Page Not exists" });
  try {
    
    const response = await callGraphAPI(`${page_id}`,"GET",{fields:'instagram_business_account',access_token:page_token});
    if(response){
      res.status(200).json(response);
      ig_id = response.instagram_business_account.id;
    }
    console.log('Instagram ID:  '+ ig_id);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Instagram account ID attached to page" });
  }
};

const getIGFeed = async (req, res) => {
  const page_token = sharedstate.getPageToken();
  if (!ig_id) return res.status(401).json({ error: "IG account ID not exists" });
  try {
    const response = await callGraphAPI(`${ig_id}/media`,"GET",{access_token:page_token});
    if(response){
      res.status(200).json(response);
      media_ids = (response.data || []).map(media => media.id);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Instagram Feed or media" });
  }
};

const postIGComment = async (req, res) => {
  const page_token = sharedstate.getPageToken();
  if (!media_ids || media_ids.length === 0) return res.status(400).json({ error: "No media available to perform this operation" });
  try {
    const response = await callGraphAPI(`${media_ids[0]}/comments`,'POST',{message:"Commenting itself on the media...!",access_token:page_token});
    if(response) res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post comment on media" });
  }
};

const getIGComments = async (req, res) => {
  const page_token = sharedstate.getPageToken();
  if (!media_ids) return res.status(401).json({ error: "No any media found" });
  try {
    const response = await callGraphAPI(`${media_ids[0]}/comments`,'GET',{access_token:page_token});
    if(response) {
      res.status(200).json(response);
      media_comment_ids = (response.data || []).map(comment => comment.id);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Instagram comments" });
  }
};

const getIGCommentReplies = async (req, res) => {
  const page_token = sharedstate.getPageToken();
  if(!media_ids || !media_comment_ids) return res.status(401).json({error: "media or Comments ID's not found..!"});
  try {
    const response = await callGraphAPI(`${media_comment_ids[2]}/replies`,'GET',{access_token:page_token});
    if(response) res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to fetch replies"});
  }
};

module.exports = {
  requireAuth,
  getIGAccount,
  getIGFeed,
  // getFacebookPages,
  postIGComment,
  getIGComments,
  getIGCommentReplies
};
