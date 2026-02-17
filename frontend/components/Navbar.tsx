"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-lg border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                GEAC
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  href="/"
                  className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Eventos
                </Link>
                <Link
                  href="/meus-eventos"
                  className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Meus Eventos
                </Link>
                <Link
                  href="/certificados"
                  className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Certificados
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Bem-vindo,{" "}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {user?.name ?? "Usuário"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/signin"
                  className="px-4 py-2 text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
