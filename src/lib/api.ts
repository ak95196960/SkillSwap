import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://skillswap-backend-2zyk.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and network issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      error.message = 'Network error. Please check your connection.';
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    linkedinProfile: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  updateProfile: (userData: any) => api.put('/users/profile', userData),
  
  getUserById: (id: string) => api.get(`/users/${id}`),
  
  searchUsers: (params: {
    search?: string;
    skills?: string;
    location?: string;
    page?: number;
    limit?: number;
  }) => api.get('/users', { params }),
};

// Skills API
export const skillsAPI = {
  createListing: (listingData: {
    title: string;
    description: string;
    category: string;
    level: string;
    timeCommitment: string;
    availability: string;
    location: string;
    skillsWanted: string[];
  }) => api.post('/skills', listingData),

  getListings: (params: {
    search?: string;
    category?: string;
    level?: string;
    location?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }) => api.get('/skills', { params }),

  getListingById: (id: string) => api.get(`/skills/${id}`),

  updateListing: (id: string, listingData: any) =>
    api.put(`/skills/${id}`, listingData),

  deleteListing: (id: string) => api.delete(`/skills/${id}`),
};

// Matches API
export const matchesAPI = {
  createMatch: (matchData: {
    targetUserId: string;
    notes?: string;
  }) => api.post('/matches', matchData),

  getMatches: (params: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/matches', { params }),

  updateMatchStatus: (id: string, status: string) =>
    api.put(`/matches/${id}/status`, { status }),

  deleteMatch: (id: string) => api.delete(`/matches/${id}`),
};

// Match Requests API
export const matchRequestsAPI = {
  sendRequest: (requestData: {
    receiverId: string;
    skillOffered: string;
    skillWanted: string;
    message?: string;
  }) => {
    console.log('API: Sending request with data:', requestData);
    return api.post('/match-requests', requestData);
  },

  getReceivedRequests: (params: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/match-requests/received', { params }),

  getSentRequests: (params: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/match-requests/sent', { params }),

  acceptRequest: (id: string) => {
    console.log('API: Accepting request with ID:', id);
    return api.put(`/match-requests/${id}/accept`);
  },

  declineRequest: (id: string) => {
    console.log('API: Declining request with ID:', id);
    return api.put(`/match-requests/${id}/decline`);
  },

  getRequestCount: () => api.get('/match-requests/count'),
};

export default api;
