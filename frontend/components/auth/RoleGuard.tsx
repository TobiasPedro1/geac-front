"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
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

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return null; // Ou um componente de Loading
  }

  return <>{children}</>;
}
