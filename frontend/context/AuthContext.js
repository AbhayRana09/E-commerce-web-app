"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on app load if token exists
  useEffect(() => {
    async function loadUser() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        try {
          const userData = await api.get("/api/auth/me");
          setUser(userData);
        } catch (err) {
          console.warn("Session expired or invalid, clearing credentials.");
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    const userData = await api.get("/api/auth/me");
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const data = await api.post("/api/auth/register", formData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
