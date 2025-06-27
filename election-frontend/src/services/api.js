import axios from "axios"
import toast from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    if (error.response?.status >= 500) {
      toast.error("Terjadi kesalahan server. Silakan coba lagi.")
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) => api.put("/auth/change-password", passwordData),
}

// Elections API
export const electionsAPI = {
  getAll: () => api.get("/admin/elections"),
  getActive: () => api.get("/elections"),
  getById: (id) => api.get(`/elections/${id}`),
  create: (electionData) => api.post("/admin/elections", electionData),
  update: (id, electionData) => api.put(`/admin/elections/${id}`, electionData),
  updateStatus: (id, status) => api.put(`/admin/elections/${id}/status`, { status }),
  delete: (id) => api.delete(`/admin/elections/${id}`),
  getResults: (id) => api.get(`/admin/elections/${id}/results`),
}

// Candidates API
export const candidatesAPI = {
  getByElection: (electionId) => api.get(`/candidates/election/${electionId}`),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (candidateData) => api.post("/candidates", candidateData),
  update: (id, candidateData) => api.put(`/candidates/${id}`, candidateData),
  delete: (id) => api.delete(`/candidates/${id}`),
}

// Votes API
export const votesAPI = {
  cast: (voteData) => api.post("/votes", voteData),
  getStatus: (electionId) => api.get(`/votes/status/${electionId}`),
  verify: (voteHash) => api.get(`/votes/verify/${voteHash}`),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  verifyUser: (userId) => api.put(`/admin/users/${userId}/verify`),
  getAnalytics: (params) => api.get("/admin/analytics/voting", { params }),
}

export default api
