import axios from "axios";

export const forumApi = {
  getCategories: async () => {
    const res = await axios.get("/api/forum/categories");
    return res.data.categories || [];
  },

  getThreads: async ({ categoryId, page = 1, sort = "newest" }) => {
    const params = { page, sort };
    if (categoryId) params.categoryId = categoryId;
    const res = await axios.get("/api/forum/threads", { params });
    return res.data;
  },

  getThread: async (threadId) => {
    const res = await axios.get(`/api/forum/threads/${threadId}`);
    return res.data.thread;
  },

  createThread: async (data) => {
    const res = await axios.post("/api/forum/threads", data);
    return res.data.thread;
  },

  likeThread: async ({ threadId, userId }) => {
    const res = await axios.post(`/api/forum/threads/${threadId}/like`, { userId });
    return res.data;
  },

  getReplies: async (threadId) => {
    const res = await axios.get(`/api/forum/threads/${threadId}/replies`);
    return res.data.replies || [];
  },

  addReply: async ({ threadId, content, authorId, authorName, authorRole, parentReplyId }) => {
    const res = await axios.post(`/api/forum/threads/${threadId}/reply`, {
      content, authorId, authorName, authorRole, parentReplyId,
    });
    return res.data.reply;
  },

  likeReply: async ({ replyId, userId }) => {
    const res = await axios.post(`/api/forum/replies/${replyId}/like`, { userId });
    return res.data;
  },
};

export default forumApi;
