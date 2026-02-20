"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

// ✅ MELHORIA: Componente de loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  );
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/signin");
      } else if (user && !allowedRoles.includes(user.role)) {
        router.push("/events"); // Redireciona se não tiver permissão
      }
    }
  }, [isAuthenticated, user, isLoading, router, allowedRoles]);

  // ✅ MELHORIA: Mostra skeleton em vez de tela branca
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // ✅ MELHORIA: Mostra skeleton enquanto redireciona
  if (!user || !allowedRoles.includes(user.role)) {
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
