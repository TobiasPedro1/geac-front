import { eventService } from "@/services/eventService";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building,
  Users,
  CheckCircle,
  Tag,
  Video,
  Lock,
  XCircle,
} from "lucide-react";
import { EventRegistrationButton } from "@/components/events/EventRegistrationButton";
import { Event, EventStatus } from "@/types/event";
import { JSX } from "react";
import {
  getEventEvaluations,
  getUserOrganizers,
} from "@/app/actions/domainActions";
import { OrganizerResponseDTO } from "@/types/organizer";
import { EventEvaluationForm } from "@/components/events/EventEvaluationForm";
import { EvaluationResponseDTO } from "@/types/evaluations";
import { EventEvaluationsList } from "@/components/events/EventEvaluationsList";
import { getCurrentUserId } from "@/app/actions/userActions";

const getCategoryColor = (category: string) => {
  switch (category) {
    case "workshop":
      return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800";
    case "palestra":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "seminario":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "cultural":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case "feira":
      return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800";
    case "conferencia":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    case "festival":
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

export default async function EventDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event: Event;
  let organizers: OrganizerResponseDTO[] = [];
  let evaluations: EvaluationResponseDTO[] = [];
  let currentUserId: string | null = null;
  let hasAlreadyEvaluated = false;

  try {
    event = await eventService.getEventById(id);
    console.log(event.status);
  } catch (error) {
    console.error(error);
    return notFound();
  }

  try {
    organizers = await getUserOrganizers();
  } catch (error) {
    console.error("Erro ao buscar organizadores:", error);
  }

  if (event.status === EventStatus.COMPLETED) {
    try {
      evaluations = await getEventEvaluations(id);
      currentUserId = (await getCurrentUserId()) as string;
      if (currentUserId) {
        hasAlreadyEvaluated = evaluations.some(
          (ev) => String(ev.userId) === currentUserId,
        );
      }
    } catch (error) {
      console.error("Erro ao buscar avaliações do evento:", error);
    }
  }

  const dateObj = new Date(event.date + "T00:00:00");
  const fullDate = dateObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const now = new Date();

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(now);

  const currentTimeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  const isPastDate = event.date < todayStr;
  const isPastTime =
    event.date === todayStr && event.startTime <= currentTimeStr;
  const isPast = isPastDate || isPastTime;
  const isToday = event.date === todayStr;

  const spotsLeft = event.capacity - event.registered;
  const isFull = spotsLeft <= 0;
  const isAllowedToEvaluate =
    event.status === EventStatus.COMPLETED &&
    event.isRegistered &&
    event.userAttended;

  const isCanceled = event.status === EventStatus.CANCELLED;
  const isCompleted = event.status === EventStatus.COMPLETED;

  const handleTopEventTag = (
    isCanceled: boolean,
    isCompleted: boolean,
    isPast: boolean,
    isFull: boolean,
    event: Event,
  ): JSX.Element | null => {
    if (isCanceled) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Cancelado
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-red-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Finalizado
        </span>
      );
    }
    if (isPast) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-200 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Encerrado
        </span>
      );
    }
    if (isFull && !event.isRegistered) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          Esgotado
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getCategoryColor(event.category)}`}
                >
                  {event.category}
                </span>

                {handleTopEventTag(
                  isCanceled,
                  isCompleted,
                  isPast,
                  isFull,
                  event,
                )}

                {event.isRegistered && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Inscrito
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                {event.title}
              </h1>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  Descrição
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-zinc-500" />
                Palestrantes / Convidados
              </h3>
              <ul className="grid gap-3">
                {event.speakers.map((speaker, index) => (
                  <li
                    key={index}
                    className="flex items-center p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {speaker}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-zinc-500" />
                Requisitos
              </h3>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-300 ml-1">
                {event.requirements.map((req) => (
                  <li key={req.id}>{req.description}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-zinc-500" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-sm border border-zinc-200 dark:border-zinc-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {event.status === EventStatus.COMPLETED && (
              <>
                <hr className="border-zinc-200 dark:border-zinc-800 my-8" />
                <EventEvaluationsList evaluations={evaluations} />
                <div className="mt-12">
                  {hasAlreadyEvaluated ? (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800 mt-8">
                      <h3 className="text-lg font-bold text-green-900 dark:text-green-400 mb-2">
                        Avaliação Registrada
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-500">
                        Você já enviou sua avaliação para este evento.
                        Agradecemos muito pelo seu feedback!
                      </p>
                    </div>
                  ) : isAllowedToEvaluate ? (
                    <EventEvaluationForm eventId={event.id} />
                  ) : (
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-6 text-center border border-zinc-200 dark:border-zinc-700/50 mt-8">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                        Sua Opinião
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Apenas participantes confirmados que registraram
                        presença podem enviar avaliações.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
                Detalhes do Evento
              </h3>
              <div className="space-y-6">
                {event.onlineLink && !isPast && !isCanceled && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                      Transmissão Online
                    </p>

                    {isToday && event.isRegistered ? (
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm"
                      >
                        <Video className="w-4 h-4" />
                        Acessar Reunião
                      </a>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-3 px-4 bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md border border-dashed border-blue-300 dark:border-blue-700 text-center">
                        <Lock className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">
                          {event.isRegistered
                            ? "O link será liberado aqui no dia do evento."
                            : "Inscreva-se para acessar o link no dia do evento."}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-fit">
                    <Calendar className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Data
                    </p>
                    <p className="text-zinc-900 dark:text-white font-medium capitalize">
                      {fullDate}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-fit">
                    <Clock className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Horário
                    </p>
                    <p className="text-zinc-900 dark:text-white font-medium">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-fit">
                    <MapPin className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Localização
                    </p>
                    <p className="text-zinc-900 dark:text-white font-medium">
                      {event.location}
                    </p>
                    {!event.onlineLink && (
                      <p className="text-sm text-zinc-500 capitalize">
                        {event.campus}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-fit">
                    <Building className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Organizador
                    </p>
                    <p className="text-zinc-900 dark:text-white font-medium">
                      {event.organizer}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {event.organizerEmail}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-fit">
                    <Users className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Capacidade
                    </p>
                    <p className="text-zinc-900 dark:text-white font-medium">
                      {event.registered} / {event.capacity} inscritos
                    </p>
                    <p className="text-sm text-zinc-500">
                      {spotsLeft > 0
                        ? `${spotsLeft} vagas restantes`
                        : "Nenhuma vaga restante"}
                    </p>
                  </div>
                </div>
              </div>
              <hr className="my-6 border-zinc-200 dark:border-zinc-800" />
              <EventRegistrationButton
                eventId={event.id}
                isRegistered={event.isRegistered}
                organizerEmail={event.organizerEmail}
                isCanceled={isCanceled}
                isPast={isPast}
                isFull={isFull}
                isCompleted={isCompleted}
                organizers={organizers}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
