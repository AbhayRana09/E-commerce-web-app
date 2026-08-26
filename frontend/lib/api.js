import axios from "axios";

// Create an Axios instance with base URL
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach JWT Token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

    let message = "Something went wrong";
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      // FastAPI 422 validation errors are returned as a list of error objects
      message = detail
        .map((err) => {
          const field = err.loc ? err.loc[err.loc.length - 1] : "";
          const msg = err.msg || "Invalid input";
          return field ? `${field}: ${msg}` : msg;
        })
        .join(" | ");
    } else if (detail && typeof detail === "object") {
      message = detail.message || detail.msg || JSON.stringify(detail);
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
