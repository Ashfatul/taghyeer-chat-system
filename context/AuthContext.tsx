"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, LoginPayload } from "@/lib/types";
import { login as apiLogin, getMe as apiGetMe } from "@/lib/api/auth";
import { getStoredToken, setStoredToken } from "@/lib/api/client";
import { initSocket, disconnectSocket } from "@/lib/socket/socket";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      setToken(storedToken);

      try {
        const response = await apiGetMe(storedToken);
        if (isMounted && response?.user) {
          setUser(response.user);
          // Initialize real-time socket connection
          initSocket(storedToken);
        }
      } catch (err) {
        // Token invalid or expired
        if (isMounted) {
          setStoredToken(null);
          setToken(null);
          setUser(null);
          disconnectSocket();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiLogin(payload);
      const authToken = response.token;
      const authUser = response.user;

      setStoredToken(authToken);
      setToken(authToken);
      setUser(authUser);

      // Connect WebSocket
      initSocket(authToken);

      return authUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = token || getStoredToken();
    if (!currentToken) return;

    try {
      const response = await apiGetMe(currentToken);
      if (response?.user) {
        setUser(response.user);
      }
    } catch {
      logout();
    }
  }, [token, logout]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
