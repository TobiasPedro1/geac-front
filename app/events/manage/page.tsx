import { RoleGuard } from "@/components/auth/RoleGuard";
import EventManageContent from "./EventManageContent";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import {
  getCategories,
  getLocations,
  getRequirements,
  getSpeakers,
  getTags,
  getUserOrganizers,
} from "@/app/actions/domainActions";
import { getAllEventsAction } from "@/app/actions/eventActions";
import { UserData } from "@/types/auth";
import { getCurrentUserId } from "@/app/actions/userActions";

export const dynamic = "force-dynamic";

export default async function EventManagePage() {
  const [
    categories,
    locations,
    requirements,
    speakers,
    tags,
    organizers,
    events,
    user,
  ] = await Promise.all([
    getCategories(),
    getLocations(),
    getRequirements(),
    getSpeakers(),
    getTags(),
    getUserOrganizers(),
    getAllEventsAction(),
    getCurrentUserId(true),
  ]);

  return (
    <RoleGuard allowedRoles={["ORGANIZER", "ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Eventos
          </Link>

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Gerenciar Eventos
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Crie, edite, visualize e gerencie todos os seus eventos
                acadêmicos e culturais.
              </p>
            </div>
          </div>

          {(organizers.length === 0 && !user) ||
          !["ADMIN", "ORGANIZER"].includes((user as UserData).role) ? (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                  Acesso Restrito
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                  Você não está vinculado a nenhuma Organização no momento. Para
                  gerenciar eventos, você precisa estar cadastrado como membro
                  de pelo menos uma Organização.
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
            <EventManageContent
              initialEvents={events}
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
