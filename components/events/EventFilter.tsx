"use client";

import { Search } from "lucide-react";

interface EventFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedCampus: string;
  setSelectedCampus: (value: string) => void;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
}

export function EventFilter({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCampus,
  setSelectedCampus,
  selectedDate,
  setSelectedDate,
}: Readonly<EventFilterProps>) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
      <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-semibold">
        <Search className="w-5 h-5" />
        <h2>Busca e Filtro de Eventos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="search-input"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Palavras Chave
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Busca por palavras chave (ex: 'seminário')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="category-select"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Categoria
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          >
            <option value="">Todas as Categorias</option>
            <option value="palestra">Palestra</option>
            <option value="seminario">Seminário</option>
            <option value="cultural">Cultural</option>
            <option value="feira">Feira</option>
            <option value="workshop">Workshop</option>
            <option value="livre">Livre</option>
            <option value="conferencia">Conferência</option>
            <option value="festival">Festival</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="campus-select"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Campus
          </label>
          <select
            id="campus-select"
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          >
            <option value="">Todos os Campus</option>
            <option value="reitoria">Reitoria</option>
            <option value="ondina">Ondina</option>
            <option value="sao lazaro">São Lázaro</option>
            <option value="canela">Canela</option>
            <option value="graca">Graca</option>
            <option value="federacao">Federação</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="date-input"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Data do Evento
          </label>
          <input
            id="date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>
    </div>
  );
}
