import { RoleGuard } from "@/components/auth/RoleGuard";
import CreateEventForm from "@/app/events/CreateEventForm";
import {
  getCategories,
  getLocations,
  getRequirements,
  getTags,
} from "@/app/actions/domainActions";

export default async function NewEventPage() {
  const categories = await getCategories();
  const locations = await getLocations();
  const requirements = await getRequirements();
  const tags = await getTags();

  return (
    <RoleGuard allowedRoles={["PROFESSOR"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Cadastrar Novo Evento
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Preencha os dados abaixo para divulgar um novo evento acadêmico.
            </p>
          </div>

          {/* Passamos as listas reais como propriedades para o form */}
          <CreateEventForm
            categories={categories}
            locations={locations}
            requirements={requirements}
            tags={tags}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
