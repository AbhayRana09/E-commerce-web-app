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
      // Check if validation errors are due to missing or too short fields
      const isRequiredOrShortError = detail.some(
        (err) =>
          err.type?.includes("missing") ||
          err.type?.includes("too_short") ||
          (err.msg && (err.msg.toLowerCase().includes("required") || err.msg.toLowerCase().includes("at least")))
      );

      if (isRequiredOrShortError) {
        message = "Please complete all required fields";
      } else {
        message = detail
          .map((err) => {
            let field = err.loc ? err.loc[err.loc.length - 1] : "";
            let msg = err.msg || "Invalid input";

            if (field) {
              const formattedField = field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return `${formattedField}: ${msg}`;
            }
            return msg;
          })
          .join(" • ");
      }
    } else if (detail && typeof detail === "object") {
      message = detail.message || detail.msg || JSON.stringify(detail);
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
