"use client";

import { useState } from "react";
import {
  approveRequestAction,
  rejectRequestAction,
} from "@/app/actions/adminActions";
import { Check, X, Loader2 } from "lucide-react";
import { PendingRequestDTO } from "@/types/organizationRequests";

interface ApprovalTableProps {
  initialRequests: PendingRequestDTO[];
}

export default function ApprovalTable({
  initialRequests,
}: Readonly<ApprovalTableProps>) {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleAction = async (id: number, action: "APPROVE" | "REJECT") => {
    setProcessingId(id);
    setError("");

    try {
      const result =
        action === "APPROVE"
          ? await approveRequestAction(id)
          : await rejectRequestAction(id);

      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Erro ao processar ação:", err);
      setError("Erro inesperado ao processar a solicitação.");
    } finally {
      setProcessingId(null);
    }
  };

  if (initialRequests.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Não há solicitações pendentes no momento. Tudo limpo por aqui! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-800 shadow-sm rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Organização Solicitada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Justificativa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
              {initialRequests.map((req) => {
                const isProcessing = processingId === req.id;

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        {req.userName}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {req.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {req.organizerName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-zinc-900 dark:text-zinc-300 max-w-xs truncate"
                        title={req.justification}
                      >
                        {req.justification || "Sem justificativa."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, "APPROVE")}
                          disabled={isProcessing}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors disabled:opacity-50"
                          title="Aprovar"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "REJECT")}
                          disabled={isProcessing}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                          title="Rejeitar"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
