import axios from 'axios';

// HARDCODED BACKEND URL - GUARANTEED TO WORK
const BACKEND_URL = 'https://my-project-vzyy.onrender.com';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log the hardcoded URL
console.log('🔧 API Configuration (HARDCODED):');
console.log('- Backend URL:', BACKEND_URL);
console.log('- Current time:', new Date().toISOString());
console.log('- This should ALWAYS work now!');

// Request interceptor for debugging
API.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;
