import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAccessToken, setAccessToken, subscribeToken } from "./tokenStore";
import { refreshAccessToken, logoutRequest } from "../api/auth";

interface AuthContextValue {
  accessToken: string | null;
  isAuthReady: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    return subscribeToken(setToken);
  }, []);

  useEffect(() => {
    refreshAccessToken()
      .then((newToken) => setAccessToken(newToken))
      .catch(() => setAccessToken(null))
      .finally(() => setIsAuthReady(true));
  }, []);

  const login = (newToken: string) => setAccessToken(newToken);

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken: token, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}