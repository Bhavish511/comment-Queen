let state = {
  page_token: null,
  page_id: null
};

module.exports = {
    getPageToken: () => state.page_token,
    getPageId: () => state.page_id,
    setPageToken: (token) => (state.page_token = token),
    setPageId: (id) => (state.page_id = id),
};
console.log(state.getPageId);
console.log(state.getPageToken);

