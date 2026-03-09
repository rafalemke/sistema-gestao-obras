import { useState, createContext, useContext } from "react";
import { apiFetch } from "../services/api";



// ─── Auth Context ────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  const login = async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const can = (roles) => user && roles.includes(user.role);

  return <AuthCtx.Provider value={{ user, login, logout, can }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }