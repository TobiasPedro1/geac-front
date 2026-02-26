"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createOrganizerRequestAction } from "@/app/actions/userActions";

interface Organizer {
  id: string;
  name: string;
}

interface RequestAccessFormProps {
  organizers: Organizer[];
}

export default function RequestAccessForm({
  organizers = [],
}: Readonly<RequestAccessFormProps>) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    organizerId: organizers[0]?.id|| "",
    justification: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!user?.id || !user?.email || !user.role || !user.name) {
      setError("Erro de autenticação. Usuário não identificado.");
      setLoading(false);
      return;
    }

    if (!formData.organizerId) {
      setError("Selecione uma organização válida.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        userId: user.id,
        organizerId:formData.organizerId,
        justification: formData.justification,
      };

      const result = await createOrganizerRequestAction(payload);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setFormData({ ...formData, justification: "" });
    } catch (err) {
      setError(
        (err as Error).message || "Ocorreu um erro ao enviar sua solicitação.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (organizers.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
        Não há organizações cadastradas no sistema no momento.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700"
    >
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 text-sm">
          <h3 className="font-bold mb-1">
            Solicitação enviada com sucesso! ✅
          </h3>
          <p>
            Sua requisição foi encaminhada para os administradores. Você será
            notificado assim que for analisada.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="organizerId"
          className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200"
        >
          Organização / Departamento
        </label>
        <select
          id="organizerId"
          name="organizerId"
          required
          value={formData.organizerId}
          onChange={handleChange}
          disabled={loading || success}
          className="w-full p-2.5 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {organizers.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500">
          Selecione a organização que você deseja gerenciar.
        </p>
      </div>

      <div>
        <label
          htmlFor="justification"
          className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200"
        >
          Justificativa
        </label>
        <textarea
          id="justification"
          name="justification"
          required
          rows={4}
          placeholder="Ex: Sou o novo coordenador do laboratório e preciso cadastrar os eventos da nossa semana acadêmica..."
          value={formData.justification}
          onChange={handleChange}
          disabled={loading || success}
          className="w-full p-2.5 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Explique brevemente por que você precisa de acesso administrativo a
          esta organização.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? "Enviando solicitação..." : "Solicitar Acesso"}
      </button>
    </form>
  );
}
