import axios from 'axios';
import API_BASE_URL from './apiConfig';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log the base URL (remove this after testing)
console.log('API Base URL:', API_BASE_URL);

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
