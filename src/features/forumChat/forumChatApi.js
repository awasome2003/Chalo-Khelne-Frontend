import axios from "axios";

export const forumChatApi = {
  getForums: async (userId) => {
    const params = userId ? { userId } : {};
    const res = await axios.get("/api/forum-chat", { params });
    return res.data.forums || [];
  },

  getAllForums: async () => {
    const res = await axios.get("/api/forum-chat/all");
    return res.data.forums || [];
  },

  getForum: async (forumId) => {
    const res = await axios.get(`/api/forum-chat/${forumId}`);
    return res.data.forum;
  },

  createForum: async (data) => {
    const res = await axios.post("/api/forum-chat", data);
    return res.data.forum;
  },

  addMember: async ({ forumId, userId, name, role }) => {
    const res = await axios.post(`/api/forum-chat/${forumId}/add-member`, { userId, name, role });
    return res.data.forum;
  },

  removeMember: async ({ forumId, userId }) => {
    const res = await axios.post(`/api/forum-chat/${forumId}/remove-member`, { userId });
    return res.data.forum;
  },

  getMessages: async (forumId, before = null) => {
    const params = {};
    if (before) params.before = before;
    const res = await axios.get(`/api/forum-chat/${forumId}/messages`, { params });
    return res.data.messages || [];
  },

  sendMessage: async ({ forumId, senderId, senderName, senderRole, text, files }) => {
    const formData = new FormData();
    formData.append("senderId", senderId);
    formData.append("senderName", senderName);
    formData.append("senderRole", senderRole || "Player");
    if (text) formData.append("text", text);
    if (files) {
      for (const file of files) formData.append("files", file);
    }
    const res = await axios.post(`/api/forum-chat/${forumId}/message`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.message;
  },
};

export default forumChatApi;
