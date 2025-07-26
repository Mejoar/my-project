// API configuration utility
const getApiBaseUrl = () => {
  // If VITE_API_URL is set and not empty, use it
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '') {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  
  // In production, use the current origin (Vercel will handle API routes)
  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
