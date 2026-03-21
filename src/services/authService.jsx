import axios from "axios";

const API_URL = "http://localhost:5050/api"; // Adjust as per backend

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },
};

export default authService;
