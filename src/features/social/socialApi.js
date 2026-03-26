import axios from "axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const socialApi = {
  fetchPosts: async () => {
    const res = await axios.get("/api/posts", { headers: getAuthHeader() });
    return res.data?.posts || res.data || [];
  },

  createPost: async (postData) => {
    const res = await axios.post("/api/posts", postData, { headers: getAuthHeader() });
    return res.data;
  },

  toggleLike: async (postId) => {
    const res = await axios.post(`/api/posts/${postId}/like`, {}, { headers: getAuthHeader() });
    return res.data;
  },

  toggleSave: async (postId) => {
    const res = await axios.post(`/api/posts/${postId}/save`, {}, { headers: getAuthHeader() });
    return res.data;
  },
};

export default socialApi;
