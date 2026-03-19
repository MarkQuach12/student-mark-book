import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "../types/auth";
import { getAuthUser, setAuthUser, clearAuth } from "../utils/authStorage";
import { clearAllCache } from "../services/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isDemo: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => getAuthUser());

  const setUser = useCallback((u: AuthUser) => {
    clearAllCache();
    setAuthUser(u);
    setUserState(u);
  }, []);

  const clearUser = useCallback(() => {
    clearAllCache();
    clearAuth();
    setUserState(null);
  }, []);

  const isDemo = user?.email?.endsWith("@demo.markbook.com") ?? false;

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === "ADMIN", isDemo, setUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
