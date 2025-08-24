import React, { createContext, useContext, useEffect, useState } from "react";
import SummaryApi from "../common/index"; // your provided SummaryApi

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // true until we check profile once

  // --- helpers ---
  const getToken = () => localStorage.getItem("authToken");
  const setToken = (t) => localStorage.setItem("authToken", t);
  const clearAuth = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const authHeaders = () => {
    const token = getToken();
    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  };

  // Call protected /api/get-profile to validate token on app load
  const checkAuthStatus = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(SummaryApi.userProfile.url, {
        method: SummaryApi.userProfile.method,
        headers: {
          ...authHeaders(),
        },
      });

      // Even if res.ok is false, try to read json safely
      let data = null;
      try { data = await res.json(); } catch {}

      if (res.ok && data?.success && !data?.error) {
        // Trust backend user object
        setUser(data.data || data.user || null);
        localStorage.setItem("user", JSON.stringify(data.data || data.user || null));
        setIsAuthenticated(true);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- public methods for components (used by your LoginForm) ---

  const register = async ({ username, password }) => {
    try {
      const res = await fetch(SummaryApi.userRegister.url, {
        method: SummaryApi.userRegister.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data?.success && !data?.error) {
        return { success: true, message: data.message || "Registration successful" };
      }
      return { success: false, message: data?.message || "Registration failed" };
    } catch (e) {
      return { success: false, message: "Registration failed. Please try again." };
    }
  };

  const login = async ({ username, password }) => {
    try {
      const res = await fetch(SummaryApi.userLogin.url, {
        method: SummaryApi.userLogin.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data?.success && data?.data?.token) {
        const { token, user: userData } = data.data;
        setToken(token);
        // Backend may return user in data.user; keep in both state and localStorage
        setUser(userData || null);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData || null));
        return { success: true, message: data.message || "Login successful" };
      }

      return { success: false, message: data?.message || "Invalid credentials" };
    } catch (e) {
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch(SummaryApi.userLogout.url, {
        method: SummaryApi.userLogout.method,
        headers: {
          ...authHeaders(),
        },
      });
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuth();
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    // expose checker if you want to re-verify manually after token refresh, etc.
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
