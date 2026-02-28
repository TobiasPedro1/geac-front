"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
} from "lucide-react";
import { OrganizationEngagementDTO } from "@/types/organizationEngagement";

interface OrganizationEngagementContentProps {
  initialData: OrganizationEngagementDTO[];
}

type SortField =
  | "organizerName"
  | "totalEventosRealizados"
  | "totalParticipantesEngajados";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 10;

export default function OrganizationEngagementContent({
  initialData,
}: Readonly<OrganizationEngagementContentProps>) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(
    "totalParticipantesEngajados",
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Métricas agregadas ──
  const metrics = useMemo(() => {
    const totalOrgs = initialData.length;
    const totalEvents = initialData.reduce(
      (sum, o) => sum + o.totalEventosRealizados,
      0,
    );
    const totalEngaged = initialData.reduce(
      (sum, o) => sum + o.totalParticipantesEngajados,
      0,
    );
    const avgEventsPerOrg =
      totalOrgs > 0 ? Math.round((totalEvents / totalOrgs) * 10) / 10 : 0;
    const avgEngagedPerOrg =
      totalOrgs > 0 ? Math.round((totalEngaged / totalOrgs) * 10) / 10 : 0;
    const activeOrgs = initialData.filter(
      (o) => o.totalEventosRealizados > 0,
    ).length;

    return {
      totalOrgs,
      totalEvents,
      totalEngaged,
      avgEventsPerOrg,
      avgEngagedPerOrg,
      activeOrgs,
    };
  }, [initialData]);

  // ── Top 5 organizações por engajamento ──
  const topByEngagement = useMemo(() => {
    return [...initialData]
      .sort(
        (a, b) => b.totalParticipantesEngajados - a.totalParticipantesEngajados,
      )
      .slice(0, 5);
  }, [initialData]);

  // ── Top 5 organizações por eventos ──
  const topByEvents = useMemo(() => {
    return [...initialData]
      .sort((a, b) => b.totalEventosRealizados - a.totalEventosRealizados)
      .slice(0, 5);
  }, [initialData]);

  // ── Distribuição de atividade ──
  const activityDistribution = useMemo(() => {
    const inactive = initialData.filter(
      (o) => o.totalEventosRealizados === 0,
    ).length;
    const low = initialData.filter(
      (o) => o.totalEventosRealizados >= 1 && o.totalEventosRealizados <= 3,
    ).length;
    const medium = initialData.filter(
      (o) => o.totalEventosRealizados >= 4 && o.totalEventosRealizados <= 10,
    ).length;
    const high = initialData.filter(
      (o) => o.totalEventosRealizados > 10,
    ).length;
    const total = initialData.length || 1;

    return [
      {
        label: "Inativas",
        count: inactive,
        pct: Math.round((inactive / total) * 100),
        color: "bg-zinc-400",
        dotColor: "bg-zinc-400",
      },
      {
        label: "Baixa (1-3)",
        count: low,
        pct: Math.round((low / total) * 100),
        color: "bg-amber-500",
        dotColor: "bg-amber-500",
      },
      {
        label: "Média (4-10)",
        count: medium,
        pct: Math.round((medium / total) * 100),
        color: "bg-blue-500",
        dotColor: "bg-blue-500",
      },
      {
        label: "Alta (10+)",
        count: high,
        pct: Math.round((high / total) * 100),
        color: "bg-emerald-500",
        dotColor: "bg-emerald-500",
      },
    ];
  }, [initialData]);

  // ── Filtragem ──
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return initialData;
    return initialData.filter((o) =>
      o.organizerName.toLowerCase().includes(term),
    );
  }, [initialData, search]);

  // ── Ordenação ──
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === "organizerName") {
        comparison = a.organizerName.localeCompare(b.organizerName, "pt-BR");
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

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Building2 className="w-5 h-5 text-blue-500" />}
          label="Organizações"
          value={metrics.totalOrgs}
          subtitle={`${metrics.activeOrgs} ativas`}
        />
        <MetricCard
          icon={<Calendar className="w-5 h-5 text-indigo-500" />}
          label="Eventos Realizados"
          value={metrics.totalEvents}
          subtitle={`${metrics.avgEventsPerOrg} por organização`}
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-emerald-500" />}
          label="Participantes Engajados"
          value={metrics.totalEngaged}
          subtitle={`${metrics.avgEngagedPerOrg} por organização`}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
          label="Taxa de Atividade"
          value={
            metrics.totalOrgs > 0
              ? `${Math.round((metrics.activeOrgs / metrics.totalOrgs) * 100)}%`
              : "–"
          }
          subtitle="organizações com eventos"
        />
      </div>

      {/* ── Painel central: Rankings + Distribuição ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top 5 por Engajamento */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Top 5 — Engajamento
            </h2>
          </div>

          {topByEngagement.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum dado disponível.
            </p>
          ) : (
            <div className="space-y-3">
              {topByEngagement.map((org, idx) => {
                const max =
                  topByEngagement[0]?.totalParticipantesEngajados || 1;
                const barWidth = Math.max(
                  (org.totalParticipantesEngajados / max) * 100,
                  4,
                );

                return (
                  <div key={org.organizerId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate">
                          {org.organizerName}
                        </span>
                      </div>
                      <span className="flex-shrink-0 ml-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        {org.totalParticipantesEngajados}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 5 por Eventos */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Top 5 — Eventos
            </h2>
          </div>

          {topByEvents.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum dado disponível.
            </p>
          ) : (
            <div className="space-y-3">
              {topByEvents.map((org, idx) => {
                const max = topByEvents[0]?.totalEventosRealizados || 1;
                const barWidth = Math.max(
                  (org.totalEventosRealizados / max) * 100,
                  4,
                );

                return (
                  <div key={org.organizerId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate">
                          {org.organizerName}
                        </span>
                      </div>
                      <span className="flex-shrink-0 ml-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        {org.totalEventosRealizados}
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

        {/* Distribuição de Atividade */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Nível de Atividade
            </h2>
          </div>

          {initialData.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhuma organização cadastrada.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Barra empilhada */}
              <div className="flex h-4 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                {activityDistribution.map(
                  (d) =>
                    d.count > 0 && (
                      <div
                        key={d.label}
                        className={`${d.color} transition-all duration-500`}
                        style={{ width: `${d.pct}%` }}
                        title={`${d.label}: ${d.count} (${d.pct}%)`}
                      />
                    ),
                )}
              </div>

              {/* Legenda detalhada */}
              <div className="space-y-2">
                {activityDistribution.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${d.dotColor}`}
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {d.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {d.count}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 w-8 text-right">
                        {d.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Busca ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar organização por nome..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* ── Tabela ── */}
      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 text-center">
          <Building2 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-zinc-600 dark:text-zinc-400">
            {search
              ? "Nenhuma organização encontrada para a busca realizada."
              : "Nenhum dado de engajamento disponível."}
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
                      onClick={() => handleSort("organizerName")}
                    >
                      <span className="flex items-center">
                        Organização
                        <SortIcon field="organizerName" />
                      </span>
                    </th>
                    <th
                      className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("totalEventosRealizados")}
                    >
                      <span className="flex items-center justify-center">
                        Eventos Realizados
                        <SortIcon field="totalEventosRealizados" />
                      </span>
                    </th>
                    <th
                      className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("totalParticipantesEngajados")}
                    >
                      <span className="flex items-center justify-center">
                        Participantes Engajados
                        <SortIcon field="totalParticipantesEngajados" />
                      </span>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Engajamento / Evento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
                  {paginated.map((org) => {
                    const avgEngPerEvent =
                      org.totalEventosRealizados > 0
                        ? Math.round(
                            org.totalParticipantesEngajados /
                              org.totalEventosRealizados,
                          )
                        : 0;

                    const maxEngaged =
                      sorted.length > 0
                        ? Math.max(
                            ...sorted.map((o) => o.totalParticipantesEngajados),
                          )
                        : 1;
                    const barWidth =
                      maxEngaged > 0
                        ? Math.max(
                            (org.totalParticipantesEngajados / maxEngaged) *
                              100,
                            3,
                          )
                        : 0;

                    return (
                      <tr
                        key={org.organizerId}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {org.organizerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-white">
                              {org.organizerName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Calendar className="w-3.5 h-3.5" />
                            {org.totalEventosRealizados}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Users className="w-3.5 h-3.5" />
                              {org.totalParticipantesEngajados}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {avgEngPerEvent > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                ~{avgEngPerEvent} / evento
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                —
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-700">
              {paginated.map((org) => {
                const avgEngPerEvent =
                  org.totalEventosRealizados > 0
                    ? Math.round(
                        org.totalParticipantesEngajados /
                          org.totalEventosRealizados,
                      )
                    : 0;

                return (
                  <div
                    key={org.organizerId}
                    className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {org.organizerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        {org.organizerName}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Calendar className="w-3 h-3" />
                        {org.totalEventosRealizados} eventos
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Users className="w-3 h-3" />
                        {org.totalParticipantesEngajados} engajados
                      </span>
                      {avgEngPerEvent > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          ~{avgEngPerEvent} / evento
                        </span>
                      )}
                    </div>
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
                organizações
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
