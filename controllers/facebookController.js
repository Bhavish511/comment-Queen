const { callGraphAPI,extendUserAccessToken } = require('../services/graphApi');
const sharedState = require('../utils/sharedstate');
// const { getPageToken, getPageId } = require('../utils/sharedstate');

let page_token= null;
let page_id = null;
let post_ids = [];
// const requireAuth = (req, res, next) => {
//   const usertoken = req.session.tokens?.accessToken;
//   if (!usertoken) return res.status(401).json({ error: "Unauthorized. Please login first." });
//   const now = Date.now();
//   const expiresAt = req.session.tokens?.expiresAt;

//   if (expiresAt && now > expiresAt) {
//     return res.status(401).json({ error: "Session expired. Please re-login." });
//   }
//   next();
// };
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

const getUserInfo = async (req, res) => {
  const user_token = req.session.tokens?.accessToken;
  if (!user_token) return res.status(401).json({ error: "User not authenticated" });
  try {
    const data = await callGraphAPI("me", "GET", { fields: "id,name", access_token:user_token });
    if(data) res.status(200).json(data);
    else res.status(500).json({ error: "Failed to fetch user info." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user info." });
  }
};

const getFacebookPages = async (req, res) => {
  const user_token = req.session.tokens?.accessToken;
  if (!user_token) return res.status(401).json({ error: "User not authenticated" });
  try {
    const data = await callGraphAPI("me/accounts", "GET", { access_token:user_token });
    if(data) {
      res.status(200).json(data);
      page_token = data.data[0].access_token;
      page_id = data.data[0].id;
      sharedState.setPageToken(page_token);
      sharedState.setPageId(page_id);
      console.log("Token Stored");
      const page_token1 = sharedState.getPageToken();
      const page_id1 = sharedState.getPageId();

      console.log("Page Token:", page_token1);
      console.log("Page ID:", page_id1);
      // setPageCredentials(page_token,page_id);
      // const iddddd = getPageId();
      // console.log(getPageId());
      // console.log(getPageToken());

    } else {
      res.status(500).json({ error: "Failed to fetch pages." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pages." });
  }
};

let post_ids_title = [];
const getpagefeed = async (req, res)=>{
  console.log(page_token);
  console.log(page_id);
  // console.log("Full session:", req.session);
  if(!page_token || !page_id) return res.status(401).json({ error: "Page_Token or Page_Id not found" });
  try {
    const data = await callGraphAPI(`${page_id}/feed`, "GET", { access_token:page_token });
    res.status(200).json(data);
    post_ids_title = (data.data || []).map(post => ({id: post.id,message: post.message}));
    console.log(post_ids_title);
    // console.log(data);
  } catch (err) {
    console.error("Graph API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch page Feed." });  }
};
let comment_ids_msg = [];
const getpostcomments = async (req, res) => {
  console.log(post_ids_title);
  if(!post_ids_title) return res.status(401).json({ error: "post not found" });
  try {
    post_ids = post_ids_title.map(post => post.id);
    console.log(post_ids);
    const comments = await callGraphAPI(`${post_ids[0]}/comments`, "GET", {access_token : page_token });
    res.status(200).json(comments);
    comment_ids_msg = (comments.data || []).map(comment => ({id: comment.id,message: comment.message}));
    console.log(comment_ids_msg);
    // console.log(comments);  
  } catch (err) {
    console.error("Graph API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch page Feed." });  };
};

const post_comment = async (req, res) => {
  if(!post_ids_title) return res.status(401).json({ error: "post not found" });

  try {
    const response = await callGraphAPI(`${post_ids[0]}/comments`,"POST",{message:"Commenting itself on the post...!", access_token:page_token});
    res.status(200).json(response);
    console.log(response);

  } catch (err) {
    console.error("Graph API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to comment on Post." });  
  }

};

const post_comment_reply = async (req, res) => {
  console.log('sdnvjnvs');
  
  if(!comment_ids_msg) return res.status(401).json({ error: "comment not found" });
  try {
    const comment_ids = comment_ids_msg.map(comment => comment.id);
    console.log(comment_ids);
    const response = await callGraphAPI(`${comment_ids[0]}/comments`,"POST",{message:'THANKYOUU for commenting ......!', access_token:page_token });
    res.status(200).json(response);
    console.log(response);
  } catch (err) {
    console.error("Graph API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to reply a comme" });  
  };
};

const post_comment_replies = async (req, res) => {
  
  if(!comment_ids_msg) return res.status(401).json({ error: "comment not found" });
  try {
    const comment_ids = comment_ids_msg.map(comment => comment.id);
    console.log(comment_ids);
    const response = await callGraphAPI(`${comment_ids[1]}`,'GET',{fields: 'comments', access_token:page_token})
    res.status(200).json(response);
    // console.log(response);
  } catch (err) {
    console.error("Graph API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch the replies of comment." });  
  }
};


module.exports = {
  requireAuth,
  getUserInfo,
  getFacebookPages,
  getpagefeed,
  getpostcomments,
  post_comment,
  post_comment_reply,
  post_comment_replies,
  // getPageToken,
  // getPageId
};
