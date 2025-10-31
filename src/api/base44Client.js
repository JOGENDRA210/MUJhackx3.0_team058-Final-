// src/api/base44Client.js
import axios from "axios";

// Create an Axios instance
// Ensure base URL always points to the server's /api namespace. If the
// environment variable is set without /api, append it. This avoids mistakes
// where REACT_APP_API_URL is set to http://localhost:5000 (client) but the
// server endpoints are under /api.
const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:5000/api';

const base44Client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // optional: 10s timeout
});

// ✅ Request interceptor – add auth token if available
base44Client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor – handle errors globally
base44Client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export const base44 = {
  auth: {
    signup: async (userData) => {
      const response = await base44Client.post('/auth/signup', userData);
      // response is { user, token }
      if (response?.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    },
    login: async (credentials) => {
      const response = await base44Client.post('/auth/login', credentials);
      if (response?.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    },
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },
  entities: {
    User: {
      create: async (userData) => {
        const response = await base44Client.post('/users', userData);
        return response;
      },
      getById: async (userId) => {
        const response = await base44Client.get(`/users/${userId}`);
        return response;
      },
      update: async (userId, updateData) => {
        const response = await base44Client.put(`/users/${userId}`, updateData);
        return response;
      }
    },
    Assessment: {
      create: async (assessmentData) => {
        const response = await base44Client.post('/assessments', assessmentData);
        return response;
      },
      getByUserId: async (userId) => {
        const response = await base44Client.get(`/users/${userId}/assessments`);
        return response;
      }
    },
    Portfolio: {
      create: async (portfolioData) => {
        const response = await base44Client.post('/portfolios', portfolioData);
        return response;
      },
      getByUserId: async (userId) => {
        const response = await base44Client.get(`/users/${userId}/portfolios`);
        return response;
      }
    }
  },
  integrations: {
    Core: {
      InvokeLLM: async (data) => {
        const response = await base44Client.post('/integrations/core/invoke-llm', data);
        return response;
      }
    }
  },
  analytics: {
    getInstitutionalData: async () => {
      const response = await base44Client.get('/analytics/institutional');
      return response;
    }
  }
};

export default base44Client;
