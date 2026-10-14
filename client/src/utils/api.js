// client/src/utils/api.js
import axios from "axios";
import { getAuthToken } from "./auth";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

/**
 * Normalizes and formats an image URL from backend image paths.
 * Supports /images/..., /uploads/..., full http(s) URLs, and fallback.
 */
export const getImageUrl = (path, fallback = "/assets/images/no_image.png") => {
  if (!path || typeof path !== "string") {
    return fallback;
  }

  const cleanPath = path.trim().replace(/\\/g, "/");

  if (!cleanPath) {
    return fallback;
  }

  // Already a full external URL or data URI
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://") || cleanPath.startsWith("data:")) {
    // If it mistakenly points to old port 5000, redirect to API_BASE_URL
    if (cleanPath.startsWith("http://localhost:5000/")) {
      return cleanPath.replace("http://localhost:5000", API_BASE_URL);
    }
    return cleanPath;
  }

  // Starts with leading slash
  if (cleanPath.startsWith("/")) {
    return `${API_BASE_URL}${cleanPath}`;
  }

  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Pre-configured Axios instance for YammiVerse
 */
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on login/signup endpoints
      const url = error.config?.url || "";
      if (!url.includes("/login") && !url.includes("/signup")) {
        // Optional: clear auth session on token expiration
        // clearAuthSession();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
