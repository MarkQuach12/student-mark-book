import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CurrentUser } from "../types/auth";
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  clearCurrentUser as persistClearCurrentUser,
} from "../utils/authStorage";

interface AuthContextValue {
  user: CurrentUser | null;
  setUser: (user: CurrentUser) => void;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(() =>
    getCurrentUser()
  );

  useEffect(() => {
    setUserState(getCurrentUser());
  }, []);

  const setUser = useCallback((u: CurrentUser) => {
    persistCurrentUser(u);
    setUserState(u);
  }, []);

  const clearUser = useCallback(() => {
    persistClearCurrentUser();
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
