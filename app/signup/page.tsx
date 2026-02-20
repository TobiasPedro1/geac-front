"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { SignUpData } from "@/types/auth";
import { LoadingButton } from "@/components/LoadingButton";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold mb-6 text-center text-zinc-900 dark:text-white">
            Crie sua conta
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              />
            </div>
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
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Tipo de Conta
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors bg-white dark:bg-zinc-900"
              >
                <option value="STUDENT">Estudante</option>
                <option value="PROFESSOR">Professor</option>
              </select>
            </div>

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Criando conta..."
              className="w-full mt-6"
            >
              Registrar
            </LoadingButton>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Já tem uma conta?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
