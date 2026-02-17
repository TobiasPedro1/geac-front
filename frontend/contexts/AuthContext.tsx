"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { authService } from "@/services/authService";
import { AuthContextType, CustomJwtPayload, UserData } from "@/types/auth";

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const clearLocalAuth = useCallback(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const setUserFromToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.warn("Sessão expirada.");
        return false;
      }

      const userData: UserData = {
        name: decoded.name,
        email: decoded.sub,
        role: decoded.role,
      };

      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");

      if (token) {
        const isValid = setUserFromToken(token);
        if (!isValid) {
          clearLocalAuth();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [clearLocalAuth, setUserFromToken]);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem("token", token);

      const isValid = setUserFromToken(token);

      if (isValid) {
        router.push("/");
        router.refresh();
      }
    },
    [router, setUserFromToken],
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (token) {
      await authService.logout(token);
    }

    clearLocalAuth();
    router.push("/signin");
    router.refresh();
  }, [router, clearLocalAuth]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      login,
      logout,
    }),
    [isAuthenticated, user, isLoading, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
