import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: Readonly<EventCardProps>) {
  const spotsLeft = event.capacity - event.registered;
  const isFewSpots = spotsLeft < 20 && spotsLeft > 0;

  const dateObj = new Date(event.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getRegistrationBadge = () => {
    if (event.isRegistered) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 ml-2">
          Inscrito
        </span>
      );
    }
    return null;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "palestra":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "seminario":
        return "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800";
      case "cultural":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "feira":
        return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800";
      case "workshop":
        return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800";
      case "livre":
        return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800";
      case "conferencia":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      case "festival":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
      case "outro":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getCategoryColor(event.category)}`}
          >
            {event.category}
          </span>
          {getRegistrationBadge()}
          {isFewSpots && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
              Poucas vagas
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 line-clamp-3 flex-1">
          {event.description}
        </p>

        <div className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-zinc-400" />
            <span>
              {event.registered} / {event.capacity} inscritos
              <span className="text-zinc-400 ml-1">
                ({spotsLeft} restantes)
              </span>
            </span>
          </div>
        </div>

        <Link
          href={`/events/${event.id}`}
          className="w-full mt-auto py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-sm font-medium rounded-lg transition-colors text-center block"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}
