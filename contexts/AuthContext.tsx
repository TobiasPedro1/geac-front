"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { AuthContextType, UserData } from "@/types/auth";
import { logoutAction } from "@/app/actions/auth";

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ✅ MELHORIA 1: Cache para evitar requisições desnecessárias
const SESSION_CACHE_TIME = 5 * 60 * 1000; // 5 minutos

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ MELHORIA 2: Refs para controlar cache
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  const pathname = usePathname();

  const checkSession = useCallback(async (force = false) => {
    const now = Date.now();
    
    // ✅ MELHORIA 3: Usar cache se requisição recente
    if (!force && now - lastCheckRef.current < SESSION_CACHE_TIME) {
      return; // Skip se checou nos últimos 5 min
    }

    // ✅ MELHORIA 4: Evitar múltiplas requisições simultâneas
    if (isCheckingRef.current) {
      return;
    }

    try {
      isCheckingRef.current = true;
      const res = await fetch("/api/me", { cache: "no-store" });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
        lastCheckRef.current = now; // ✅ Atualiza cache
      } else {
        throw new Error("Não logado");
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      lastCheckRef.current = 0; // ✅ Limpa cache em erro
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, []);

  // ✅ MELHORIA 5: Checar apenas na montagem inicial
  useEffect(() => {
    checkSession(true); // Force no primeiro carregamento
  }, []); // ❌ Removido pathname!

  // ✅ MELHORIA 6: Revalidar apenas em rotas específicas
  useEffect(() => {
    // Só revalida em rotas protegidas
    const protectedRoutes = ['/events', '/certificados', '/meus-eventos'];
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtected) {
      checkSession(); // Usa cache automático
    }
  }, [pathname, checkSession]);

  const logout = useCallback(async () => {
    try {
      await logoutAction();
    } finally {
      // ✅ MELHORIA 7: Limpa estado mesmo se logout falhar
      setUser(null);
      setIsAuthenticated(false);
      lastCheckRef.current = 0;
    }
  }, []);

  const login = useCallback(() => {
    // ✅ MELHORIA 8: Force refresh após login
    lastCheckRef.current = 0;
    checkSession(true);
  }, [checkSession]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      logout,
      login,
      isLoading,
    }),
    [user, isAuthenticated, logout, login, isLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);