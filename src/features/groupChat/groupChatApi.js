import axios from "axios";

const BASE = "/api/group-chat";

export const groupChatApi = {
  getChats: async (userId) => {
    const res = await axios.get(BASE, { params: { userId } });
    return res.data.chats || [];
  },

  getChat: async (chatId) => {
    const res = await axios.get(`${BASE}/${chatId}`);
    return res.data.chat;
  },

  createChat: async (data) => {
    const res = await axios.post(BASE, data);
    return res.data.chat;
  },

  addMember: async ({ chatId, requesterId, userId, name, role }) => {
    const res = await axios.post(`${BASE}/${chatId}/add`, { requesterId, userId, name, role });
    return res.data.chat;
  },

  removeMember: async ({ chatId, requesterId, userId }) => {
    const res = await axios.post(`${BASE}/${chatId}/remove`, { requesterId, userId });
    return res.data.chat;
  },

  deleteChat: async ({ chatId, requesterId }) => {
    const res = await axios.delete(`${BASE}/${chatId}`, { data: { requesterId } });
    return res.data;
  },

  getMessages: async (chatId) => {
    const res = await axios.get(`${BASE}/${chatId}/messages`);
    return res.data.messages || [];
  },

  sendMessage: async ({ chatId, senderId, senderName, senderRole, text, files }) => {
    const fd = new FormData();
    fd.append("senderId", senderId);
    fd.append("senderName", senderName);
    fd.append("senderRole", senderRole || "Player");
    if (text) fd.append("text", text);
    if (files) for (const f of files) fd.append("files", f);
    const res = await axios.post(`${BASE}/${chatId}/message`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.message;
  },

  searchUsers: async (q) => {
    const res = await axios.get(`${BASE}/search-users`, { params: { q } });
    return res.data.users || [];
  },
};

export default groupChatApi;
