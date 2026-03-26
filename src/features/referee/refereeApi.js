import axios from "axios";

const getAuth = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const refereeApi = {
  fetchReferees: async () => {
    const res = await axios.get("/api/referee/referees", getAuth());
    return res.data?.referees || res.data || [];
  },

  fetchRequests: async (status) => {
    const url = status ? `/api/referee/requests?status=${status}` : "/api/referee/requests";
    const res = await axios.get(url, getAuth());
    return res.data?.requests || res.data || [];
  },

  createRequest: async (formData) => {
    const res = await axios.post("/api/referee/requests", formData, getAuth());
    return res.data;
  },

  updateRequestStatus: async ({ id, status }) => {
    const res = await axios.put(`/api/referee/requests/${id}/status`, { status }, getAuth());
    return res.data;
  },
};

export default refereeApi;
