import { RoleGuard } from "@/components/auth/RoleGuard";
import { getUsersAction } from "@/app/actions/userAdminActions";
import UserManagementClient from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsersAction();

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Gerenciar Usuários
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Visualize, altere permissões (roles) e gerencie o acesso de todos os usuários da plataforma.
            </p>
          </div>

          <UserManagementClient initialUsers={users} />
        </div>
      </div>
    </RoleGuard>
  );
}