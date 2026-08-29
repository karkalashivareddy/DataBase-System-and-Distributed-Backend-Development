import { createContext, useContext, useState, useCallback } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem("pharmastock.user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    try {
      window.localStorage.setItem("pharmastock.user", JSON.stringify(res.user));
      window.localStorage.setItem("pharmastock.token", res.token);
    } catch {
      // ignore
    }
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem("pharmastock.user");
      window.localStorage.removeItem("pharmastock.token");
    } catch {
      // ignore
    }
  }, []);

  const value = { user, login, logout, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
