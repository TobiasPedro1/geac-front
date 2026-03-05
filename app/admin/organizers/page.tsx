import { RoleGuard } from "@/components/auth/RoleGuard";
import { getOrganizersAction } from "@/app/actions/adminActions";
import OrganizerManagementClient from "./organizerManagementClient";

export const dynamic = "force-dynamic";

export default async function OrganizersPage() {
  const organizers = await getOrganizersAction();

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                Gerenciar Organizações
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Visualize, cadastre, edite e remova os departamentos ou centros acadêmicos.
              </p>
            </div>
          </div>

          <OrganizerManagementClient initialOrganizers={organizers} />
        </div>
      </div>
    </RoleGuard>
  );
}