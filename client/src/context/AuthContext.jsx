import { createContext, useEffect, useState } from "react";
import { createAuthHeaders, getApiUrl } from "../lib/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser(activeToken = token) {
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(getApiUrl("/api/auth/me"), {
        headers: createAuthHeaders(activeToken),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load user");

      setUser(data.user);
    } catch (e) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  // Load user when token changes
  useEffect(() => {
    setLoading(true);
    refreshUser(token);
  }, [token]);

  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, logout, refreshUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
