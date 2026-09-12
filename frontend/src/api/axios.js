import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("campusshare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize backend error shape ({ message }) and handle expired/invalid tokens.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : !error.response
        ? "Unable to reach the server. Check your connection."
        : "Something went wrong. Please try again.");

    if (status === 401) {
      const hadToken = !!localStorage.getItem("campusshare_token");
      localStorage.removeItem("campusshare_token");
      localStorage.removeItem("campusshare_user");
      // Only force a redirect if the user *was* authenticated (session expired),
      // so public pages hitting protected data don't get bounced unexpectedly.
      if (hadToken && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?expired=1");
      }
    }

    return Promise.reject({ status, message, raw: error });
  }
);
