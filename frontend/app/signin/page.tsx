"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { SignInData } from "@/types/auth";
import { LoadingButton } from "@/components/LoadingButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth(); // ✅ Pega função login do contexto

  const [formData, setFormData] = useState<SignInData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError(null);
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // ✅ SOLUÇÃO: Atualiza o contexto ANTES de redirecionar
      login(); // Força o AuthContext a revalidar
      
      // Pequeno delay para garantir que o contexto atualizou
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Agora sim, redireciona
      router.push("/");
      router.refresh();
      
    } catch (error) {
      // redirect() do Next.js joga um erro especial
      if (error && typeof error === 'object' && 'digest' in error) {
        // É o erro do redirect - força atualização do contexto
        login();
        return;
      }
      
      console.error('Erro no login:', error);
      setError('Erro inesperado ao fazer login');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Acesse sua conta
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {error && (
            <div 
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                disabled={isLoading}
                autoComplete="email"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              />
            </div>

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Entrando..."
              className="w-full mt-6"
            >
              Entrar
            </LoadingButton>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Não tem uma conta?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}