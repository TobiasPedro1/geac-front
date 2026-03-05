"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

type SubNavItem = {
  href: string;
  label: string;
  icon: string;
};

type NavItem = {
  href?: string;
  label: string;
  icon: string;
  roles?: string[];
  subItems?: SubNavItem[];
};

type NavConfigType = {
  public: NavItem[];
  authenticated: NavItem[];
  adminOnly: NavItem[];
};

// CONFIGURAÇÃO CENTRALIZADA - Mude aqui para adicionar/remover itens
const NAV_CONFIG: NavConfigType = {
  public: [{ href: "/", label: "Início", icon: "🏠" }],
  authenticated: [
    {
      href: "/events",
      label: "Eventos",
      icon: "📅",
      roles: ["STUDENT", "PROFESSOR", "ORGANIZER"],
    },
    {
      href: "/meus-eventos",
      label: "Meus Eventos",
      icon: "⭐",
      roles: ["STUDENT", "PROFESSOR", "ORGANIZER"],
    },
    {
      href: "/certificates",
      label: "Certificados",
      icon: "🎓",
      roles: ["STUDENT", "PROFESSOR", "ORGANIZER"],
    },
    {
      href: "/requests",
      label: "Solicitar Acesso",
      icon: "🔑",
      roles: ["STUDENT", "PROFESSOR", "ORGANIZER"],
    },
    {
      href: "/events/manage",
      label: "Gerenciar Eventos",
      icon: "📋",
      roles: ["ADMIN", "ORGANIZER"],
    },
  ],
  adminOnly: [
    {
      href: "/admin/users",
      label: "Gerenciar Usuários",
      icon: "👥",
      roles: ["ADMIN"],
    },
    {
      href: "/admin/organizers",
      label: "Gerenciar Orgs",
      icon: "🏢",
      roles: ["ADMIN"],
    },
    {
      href: "/admin/approvals",
      label: "Aprovações",
      icon: "✅",
      roles: ["ADMIN"],
    },
    {
      label: "Relatórios",
      icon: "📈",
      roles: ["ADMIN"],
      subItems: [
        { href: "/admin/student-hours", label: "Horas Alunos", icon: "⏱️" },
        { href: "/admin/event-statistics", label: "Estatísticas", icon: "📊" },
        { href: "/admin/org-engagement", label: "Engajamento", icon: "🤝" },
      ],
    },
  ],
};

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoggingOut(false);
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [isAuthenticated, pathname]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Erro ao sair", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Filtra itens baseado em autenticação e role
  const getVisibleItems = () => {
    if (!isAuthenticated) {
      return NAV_CONFIG.public;
    }

    const baseItems = NAV_CONFIG.authenticated.filter(
      (item) => !item.roles || item.roles.includes(user?.role || ""),
    );

    const adminItems = user?.role === "ADMIN" ? NAV_CONFIG.adminOnly : [];

    return [...baseItems, ...adminItems];
  };

  const visibleItems = getVisibleItems();

  // Verifica se link está ativo
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href; //|| pathname.startsWith(href + "/");
  };

  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-lg border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                GEAC
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {visibleItems.map((item, index) => {
                // Se o item tiver subItems, renderiza um Dropdown que abre no hover
                if (item.subItems) {
                  const isAnySubActive = item.subItems.some((sub) =>
                    isActiveLink(sub.href),
                  );
                  return (
                    <div key={index} className="relative group flex items-center">
                      <button
                        className={`
                          px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                          flex items-center gap-2
                          ${
                            isAnySubActive
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400"
                          }
                        `}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                        <svg
                          className="w-4 h-4 ml-1 opacity-70 group-hover:rotate-180 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Menu Dropdown - Visível no hover usando a classe 'group-hover:block' */}
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 hidden group-hover:block transition-all z-50">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`
                              flex items-center gap-3 px-4 py-2 text-sm transition-colors
                              ${
                                isActiveLink(subItem.href)
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400"
                              }
                            `}
                          >
                            <span>{subItem.icon}</span>
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Renderização de links normais
                return (
                  <Link
                    key={item.href || index}
                    href={item.href!}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      flex items-center gap-2
                      ${
                        isActiveLink(item.href!)
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400"
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - User info & actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                {/* User info - Desktop with dropdown */}
                <div className="hidden md:block relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="text-sm text-left">
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {user?.name || "Usuário"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {user?.role === "ADMIN"
                          ? "Admin"
                          : user?.role === "PROFESSOR"
                            ? "Professor"
                            : "Estudante"}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-zinc-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          Informações do Perfil
                        </p>
                      </div>

                      <div className="px-4 py-3 space-y-2">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Nome
                          </p>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {user?.name || "Não informado"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Email
                          </p>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {user?.email || "Não informado"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Tipo de Conta
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user?.role === "PROFESSOR"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {user?.role === "ADMIN"
                              ? "Administrador"
                              : user?.role === "PROFESSOR"
                                ? "Professor"
                                : "Estudante"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-200 dark:border-zinc-700 mt-2 pt-2 px-2">
                        {/*<Link
                          href="/perfil"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <span>⚙️</span>
                          <span>Configurações</span>
                        </Link>*/}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Sair da conta"
                >
                  {isLoggingOut ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Saindo...</span>
                    </>
                  ) : (
                    <>
                      <span>Sair</span>
                    </>
                  )}
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Menu"
                >
                  {isMobileMenuOpen ? (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
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

      {/* Mobile Menu - Slide down */}
      {isMobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 space-y-2">
            {/* User info mobile */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {user?.role === "PROFESSOR" ? "Professor" : "Estudante"}
                </p>
              </div>
            </div>

            {/* Mobile navigation links */}
            {visibleItems.map((item, index) => {
              // Renderização dos SubItems no Mobile (Ficam identados abaixo do título)
              if (item.subItems) {
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 text-base font-medium text-zinc-900 dark:text-white">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="pl-6 space-y-1 border-l-2 border-zinc-200 dark:border-zinc-700 ml-6">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-lg
                            ${
                              isActiveLink(subItem.href)
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                            }
                          `}
                        >
                          <span className="text-lg">{subItem.icon}</span>
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              // Links normais Mobile
              return (
                <Link
                  key={item.href || index}
                  href={item.href!}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors
                    ${
                      isActiveLink(item.href!)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile logout button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 mt-4"
            >
              {isLoggingOut ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saindo...</span>
                </>
              ) : (
                <>
                  <span>Sair</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
