"use client";

import { useState, useMemo } from "react";
import { Event } from "@/types/event";
import { EventFilter } from "@/components/events/EventFilter";
import { EventTabs } from "@/components/events/EventTabs";
import { EventCard } from "@/components/events/EventCard";

interface EventsContentProps {
  initialEvents: Event[];
}

export default function EventsContent({
  initialEvents,
}: Readonly<EventsContentProps>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState<
    "proximos" | "disponiveis" | "todos"
  >("proximos");

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.tags.some((tag) => tag.toLowerCase().includes(searchLower));

      const matchesCategory =
        selectedCategory === "" || event.category === selectedCategory;

      const matchesCampus =
        selectedCampus === "" || event.campus === selectedCampus;

      const matchesDate = selectedDate === "" || event.date === selectedDate;

      let matchesTab = true;
      const today = new Date().toISOString().split("T")[0];

      if (activeTab === "proximos") {
        matchesTab = event.date >= today;
      } else if (activeTab === "disponiveis") {
        matchesTab = event.registered < event.capacity;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCampus &&
        matchesDate &&
        matchesTab
      );
    });
  }, [
    initialEvents,
    searchTerm,
    selectedCategory,
    selectedCampus,
    selectedDate,
    activeTab,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Eventos Acadêmicos e Culturais
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Descubra e inscreva-se em eventos que acontecem em nossos campus
            universitários
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCampus={selectedCampus}
          setSelectedCampus={setSelectedCampus}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Exibindo {filteredEvents.length} eventos
          </span>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">
              Eventos não encontrados
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
              Nós não conseguimos encontrar nenhum evento que corresponda aos
              seus filtros. Tente ajustar seus critérios de busca ou limpar os
              filtros.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedCampus("");
                setSelectedDate("");
                setActiveTab("todos");
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
