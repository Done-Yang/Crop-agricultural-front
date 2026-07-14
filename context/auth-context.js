"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getToken, clearToken } from "@/lib/api-client";
import { getProfile } from "@/api/user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const token = getToken();
      const savedUser = localStorage.getItem("user");

      // No token means no session, regardless of any stale cached user.
      if (!token) {
        clearToken();
        localStorage.removeItem("user");
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Optimistically show the cached user while we revalidate the token.
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }

      try {
        const fresh = await getProfile(); // validates the JWT server-side
        if (!cancelled) {
          setUser(fresh);
          localStorage.setItem("user", JSON.stringify(fresh));
        }
      } catch {
        // Expired / invalid token — drop the session.
        clearToken();
        localStorage.removeItem("user");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    clearToken();
    localStorage.removeItem("user");
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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
