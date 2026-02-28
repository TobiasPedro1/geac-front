"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  Users,
  UserCheck,
  Star,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
} from "lucide-react";
import { EventStatisticsDTO } from "@/types/eventStatistics";

interface EventStatisticsContentProps {
  initialData: EventStatisticsDTO[];
}

type SortField =
  | "eventTitle"
  | "totalInscritos"
  | "totalPresentes"
  | "mediaAvaliacao";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  COMPLETED:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  CANCELLED:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
};

export default function EventStatisticsContent({
  initialData,
}: Readonly<EventStatisticsContentProps>) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("totalInscritos");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Métricas agregadas globais ──
  const metrics = useMemo(() => {
    const totalEvents = initialData.length;
    const activeEvents = initialData.filter(
      (e) => e.eventStatus === "ACTIVE",
    ).length;
    const completedEvents = initialData.filter(
      (e) => e.eventStatus === "COMPLETED",
    ).length;
    const cancelledEvents = initialData.filter(
      (e) => e.eventStatus === "CANCELLED",
    ).length;

    const totalInscritos = initialData.reduce(
      (sum, e) => sum + e.totalInscritos,
      0,
    );
    const totalPresentes = initialData.reduce(
      (sum, e) => sum + e.totalPresentes,
      0,
    );
    const taxaPresenca =
      totalInscritos > 0
        ? Math.round((totalPresentes / totalInscritos) * 100)
        : 0;

    const eventsWithRating = initialData.filter((e) => e.mediaAvaliacao > 0);
    const avgRating =
      eventsWithRating.length > 0
        ? eventsWithRating.reduce((sum, e) => sum + e.mediaAvaliacao, 0) /
          eventsWithRating.length
        : 0;

    return {
      totalEvents,
      activeEvents,
      completedEvents,
      cancelledEvents,
      totalInscritos,
      totalPresentes,
      taxaPresenca,
      avgRating,
    };
  }, [initialData]);

  // ── Top 5 eventos por inscritos ──
  const topEvents = useMemo(() => {
    return [...initialData]
      .sort((a, b) => b.totalInscritos - a.totalInscritos)
      .slice(0, 5);
  }, [initialData]);

  // ── Distribuição por status (para barra visual) ──
  const statusDistribution = useMemo(() => {
    const total = initialData.length || 1;
    return [
      {
        status: "ACTIVE",
        label: "Ativos",
        count: metrics.activeEvents,
        pct: Math.round((metrics.activeEvents / total) * 100),
        color: "bg-emerald-500",
      },
      {
        status: "COMPLETED",
        label: "Finalizados",
        count: metrics.completedEvents,
        pct: Math.round((metrics.completedEvents / total) * 100),
        color: "bg-blue-500",
      },
      {
        status: "CANCELLED",
        label: "Cancelados",
        count: metrics.cancelledEvents,
        pct: Math.round((metrics.cancelledEvents / total) * 100),
        color: "bg-red-500",
      },
    ];
  }, [initialData.length, metrics]);

  // ── Filtragem ──
  const filtered = useMemo(() => {
    let data = initialData;
    if (statusFilter !== "ALL") {
      data = data.filter((e) => e.eventStatus === statusFilter);
    }
    const term = search.toLowerCase().trim();
    if (term) {
      data = data.filter((e) => e.eventTitle.toLowerCase().includes(term));
    }
    return data;
  }, [initialData, search, statusFilter]);

  // ── Ordenação ──
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === "eventTitle") {
        comparison = a.eventTitle.localeCompare(b.eventTitle, "pt-BR");
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortField, sortDirection]);

  // ── Paginação ──
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.25;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(
          <Star
            key={i}
            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
          />,
        );
      } else if (i === full && hasHalf) {
        stars.push(
          <Star
            key={i}
            className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400"
          />,
        );
      } else {
        stars.push(
          <Star
            key={i}
            className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600"
          />,
        );
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Calendar className="w-5 h-5 text-blue-500" />}
          label="Total de Eventos"
          value={metrics.totalEvents}
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-indigo-500" />}
          label="Total de Inscritos"
          value={metrics.totalInscritos}
        />
        <MetricCard
          icon={<UserCheck className="w-5 h-5 text-emerald-500" />}
          label="Taxa de Presença"
          value={`${metrics.taxaPresenca}%`}
          subtitle={`${metrics.totalPresentes} de ${metrics.totalInscritos} inscritos`}
        />
        <MetricCard
          icon={<Star className="w-5 h-5 text-amber-500" />}
          label="Avaliação Média"
          value={metrics.avgRating > 0 ? metrics.avgRating.toFixed(1) : "–"}
          subtitle={
            metrics.avgRating > 0 ? `de 5.0 estrelas` : "Sem avaliações"
          }
        />
      </div>

      {/* ── Painel central: Distribuição + Ranking ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribuição por Status */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Distribuição por Status
            </h2>
          </div>

          {initialData.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum evento cadastrado.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Barra empilhada */}
              <div className="flex h-4 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                {statusDistribution.map(
                  (s) =>
                    s.count > 0 && (
                      <div
                        key={s.status}
                        className={`${s.color} transition-all duration-500`}
                        style={{
                          width: `${s.pct}%`,
                        }}
                        title={`${s.label}: ${s.count} (${s.pct}%)`}
                      />
                    ),
                )}
              </div>

              {/* Legenda */}
              <div className="grid grid-cols-3 gap-3">
                {statusDistribution.map((s) => (
                  <div key={s.status} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {s.label}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      {s.count}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {s.pct}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Eventos */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Top 5 — Mais Inscritos
            </h2>
          </div>

          {topEvents.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum evento com inscrições.
            </p>
          ) : (
            <div className="space-y-3">
              {topEvents.map((event, idx) => {
                const maxInscritos = topEvents[0]?.totalInscritos || 1;
                const barWidth = Math.max(
                  (event.totalInscritos / maxInscritos) * 100,
                  4,
                );

                return (
                  <div key={event.eventId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate">
                          {event.eventTitle}
                        </span>
                      </div>
                      <span className="flex-shrink-0 ml-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        {event.totalInscritos}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Filtros: busca + status ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar evento por título..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {[
            { value: "ALL", label: "Todos" },
            { value: "ACTIVE", label: "Ativos" },
            { value: "COMPLETED", label: "Finalizados" },
            { value: "CANCELLED", label: "Cancelados" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                statusFilter === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabela de Eventos ── */}
      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 text-center">
          <Activity className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-zinc-600 dark:text-zinc-400">
            {search || statusFilter !== "ALL"
              ? "Nenhum evento encontrado para os filtros aplicados."
              : "Nenhum dado de estatísticas disponível."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-zinc-800 shadow-sm rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("eventTitle")}
                    >
                      <span className="flex items-center">
                        Evento
                        <SortIcon field="eventTitle" />
                      </span>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("totalInscritos")}
                    >
                      <span className="flex items-center justify-center">
                        Inscritos
                        <SortIcon field="totalInscritos" />
                      </span>
                    </th>
                    <th
                      className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("totalPresentes")}
                    >
                      <span className="flex items-center justify-center">
                        Presentes
                        <SortIcon field="totalPresentes" />
                      </span>
                    </th>
                    <th
                      className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("mediaAvaliacao")}
                    >
                      <span className="flex items-center justify-center">
                        Avaliação
                        <SortIcon field="mediaAvaliacao" />
                      </span>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Presença
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
                  {paginated.map((event) => {
                    const presenceRate =
                      event.totalInscritos > 0
                        ? Math.round(
                            (event.totalPresentes / event.totalInscritos) * 100,
                          )
                        : 0;

                    return (
                      <tr
                        key={event.eventId}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white max-w-xs truncate">
                            {event.eventTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              STATUS_STYLES[event.eventStatus] ||
                              "bg-zinc-100 text-zinc-800 border-zinc-200"
                            }`}
                          >
                            {STATUS_LABELS[event.eventStatus] ||
                              event.eventStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Users className="w-3.5 h-3.5" />
                            {event.totalInscritos}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <UserCheck className="w-3.5 h-3.5" />
                            {event.totalPresentes}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {event.mediaAvaliacao > 0 ? (
                              <>
                                <div className="flex">
                                  {renderStars(event.mediaAvaliacao)}
                                </div>
                                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                  {event.mediaAvaliacao.toFixed(1)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  presenceRate >= 70
                                    ? "bg-emerald-500"
                                    : presenceRate >= 40
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${presenceRate}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 w-8 text-right">
                              {presenceRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-700">
              {paginated.map((event) => {
                const presenceRate =
                  event.totalInscritos > 0
                    ? Math.round(
                        (event.totalPresentes / event.totalInscritos) * 100,
                      )
                    : 0;

                return (
                  <div
                    key={event.eventId}
                    className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
                        {event.eventTitle}
                      </h3>
                      <span
                        className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          STATUS_STYLES[event.eventStatus] ||
                          "bg-zinc-100 text-zinc-800 border-zinc-200"
                        }`}
                      >
                        {STATUS_LABELS[event.eventStatus] || event.eventStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Users className="w-3 h-3" />
                        {event.totalInscritos} inscritos
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <UserCheck className="w-3 h-3" />
                        {event.totalPresentes} presentes
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">
                        {presenceRate}% presença
                      </span>
                    </div>

                    {event.mediaAvaliacao > 0 && (
                      <div className="flex items-center gap-1">
                        {renderStars(event.mediaAvaliacao)}
                        <span className="ml-1 text-xs text-zinc-500">
                          {event.mediaAvaliacao.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-zinc-800 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Mostrando{" "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  {Math.min(currentPage * PAGE_SIZE, sorted.length)}
                </span>{" "}
                de{" "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  {sorted.length}
                </span>{" "}
                eventos
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[4rem] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Componente de Card de Métrica ──
function MetricCard({
  icon,
  label,
  value,
  subtitle,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}>) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
