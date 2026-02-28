import { RoleGuard } from "@/components/auth/RoleGuard";
import CreateEventForm from "@/app/events/CreateEventForm";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import {
  getCategories,
  getLocations,
  getOrganizers,
  getRequirements,
  getSpeakers,
  getTags,
  getUserOrganizers,
} from "@/app/actions/domainActions";
import { getCurrentUserId } from "@/app/actions/userActions";
import { UserData } from "@/types/auth";
import { OrganizerResponseDTO } from "@/types/organizer";

export default async function NewEventPage() {
  const categories = await getCategories();
  const locations = await getLocations();
  const requirements = await getRequirements();
  const speakers = await getSpeakers();
  const tags = await getTags();
  const user = (await getCurrentUserId(true)) as UserData;
  let organizers: OrganizerResponseDTO[];
  if (user.role === "ADMIN") {
    organizers = await getOrganizers();
  } else {
    organizers = await getUserOrganizers();
  }

  return (
    <RoleGuard allowedRoles={["ORGANIZER", "ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Eventos
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Cadastrar Novo Evento
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Preencha os dados abaixo para criar e divulgar um novo evento
              acadêmico ou cultural.
            </p>
          </div>

          {(organizers.length === 0 && !user) ||
          !["ADMIN", "ORGANIZER"].includes(user.role) ? (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                  Acesso Restrito
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                  Você não está vinculado a nenhuma Organização no momento. Para
                  criar eventos, você precisa estar cadastrado como membro de
                  pelo menos uma Organização.
                </p>
                <Link
                  href="/requests"
                  className="inline-block mt-3 text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:underline"
                >
                  Solicitar acesso a uma organização &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <CreateEventForm
              categories={categories}
              locations={locations}
              requirements={requirements}
              tags={tags}
              speakers={speakers}
              organizers={organizers}
            />
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
