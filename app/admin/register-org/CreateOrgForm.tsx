"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganizerAction } from "@/app/actions/adminActions";
import { OrganizerRequestDTO } from "@/types/organizer";

export default function CreateOrgForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<OrganizerRequestDTO>({
    name: "",
    contactEmail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await createOrganizerAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setFormData({ name: "", contactEmail: "" });
      router.refresh();
    } catch (err) {
      setError(
        (err as Error).message || "Erro desconhecido ao cadastrar organização",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md"
    >
      {error && (
        <div className="text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-sm">
          Organização cadastrada com sucesso!
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-1 dark:text-gray-200"
        >
          Nome da Organização
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ex: Departamento de Computação"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="contactEmail"
          className="block text-sm font-medium mb-1 dark:text-gray-200"
        >
          Email de Contato
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          required
          placeholder="Ex: computacao@universidade.edu.br"
          value={formData.contactEmail}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:opacity-50 transition-colors"
      >
        {loading ? "Cadastrando..." : "Cadastrar Organização"}
      </button>
    </form>
  );
}
