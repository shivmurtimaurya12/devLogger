import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "../types";
import { authApi } from "../api/client";

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    username: string,
    password: string,
    displayName: string,
    email?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session on mount from the backend session/cookie
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const data = await authApi.getMe();
        if (isMounted && data?.user) {
          setCurrentUser(data.user);
        }
      } catch {
        // Not authenticated or server offline — default to guest
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      try {
        const cleanIdentifier = identifier.trim();
        if (!cleanIdentifier || !password) {
          return { ok: false, error: "Please enter your username/email and password." };
        }

        const res = await authApi.login(cleanIdentifier, password);
        setCurrentUser(res.user);
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err.message || "Failed to log in." };
      }
    },
    []
  );

  const signup = useCallback(
    async (
      username: string,
      password: string,
      displayName: string,
      email?: string
    ) => {
      try {
        const cleanUser = username.trim().toLowerCase();
        const cleanName = displayName.trim();
        const cleanEmail = email?.trim() || undefined;

        if (!cleanUser || !password || !cleanName) {
          return { ok: false, error: "Please fill out all required fields." };
        }

        if (password.length < 6) {
          return { ok: false, error: "Password must be at least 6 characters long." };
        }

        const res = await authApi.register({
          username: cleanUser,
          password,
          displayName: cleanName,
          email: cleanEmail,
        });

        setCurrentUser(res.user);
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err.message || "Failed to create account." };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setCurrentUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
