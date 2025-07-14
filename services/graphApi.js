const axios = require("axios");

const callGraphAPI = async (endpoint, method, params = {}, data = {}) => {
  const url = `https://graph.facebook.com/v23.0/${endpoint}`;
  try {
    const response = await axios({ method, url, params, data });
    if (response) return response.data;
  } catch (err) {
    console.error("Graph API Error:", err.response?.data || err.message);
    throw err;
  }
};

const extendUserAccessToken = async (shortLivedToken) => {
  const params = {
    grant_type: "fb_exchange_token",
    client_id: process.env.FB_CLIENT_ID,
    client_secret: process.env.FB_CLIENT_SECRET,
    fb_exchange_token: shortLivedToken,
  };
  
  const response = await callGraphAPI("oauth/access_token", "GET", params);
  return response.access_token;
};

module.exports = {
  callGraphAPI,
  extendUserAccessToken
};
