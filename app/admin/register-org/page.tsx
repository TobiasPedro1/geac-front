import { RoleGuard } from "@/components/auth/RoleGuard";
import CreateOrgForm from "./CreateOrgForm";

export const dynamic = "force-dynamic";

export default async function RegisterOrgPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Cadastrar Nova Organização
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Adicione os dados oficiais dos departamentos ou centros acadêmicos
              que poderão organizar eventos.
            </p>
          </div>

          <CreateOrgForm />
        </div>
      </div>
    </RoleGuard>
  );
}
