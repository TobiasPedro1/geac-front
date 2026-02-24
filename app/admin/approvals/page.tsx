import { RoleGuard } from "@/components/auth/RoleGuard";
import ApprovalTable from "./ApprovalTable";
import { getPendingRequests } from "@/app/actions/adminActions";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const pendingRequests = await getPendingRequests();

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                Painel de Aprovações
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Gerencie as solicitações de usuários (professores/alunos) que
                desejam criar e gerenciar eventos em nome de uma organização.
              </p>
            </div>

            {/* Um contador visual rápido */}
            <div className="mt-4 sm:mt-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {pendingRequests.length} pendentes
              </span>
            </div>
          </div>

          {/* Chama o Client Component passando os dados */}
          <ApprovalTable initialRequests={pendingRequests} />
        </div>
      </div>
    </RoleGuard>
  );
}
