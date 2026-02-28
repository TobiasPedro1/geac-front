"use client";

import { useState, useMemo } from "react";
import {
  Search,
  GraduationCap,
  Clock,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { StudentHoursDTO } from "@/types/studentHours";

interface StudentHoursContentProps {
  initialData: StudentHoursDTO[];
}

type SortField = "studentName" | "totalCertificadosEmitidos" | "totalHorasAcumuladas";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 10;

export default function StudentHoursContent({
  initialData,
}: Readonly<StudentHoursContentProps>) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("totalHorasAcumuladas");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Métricas agregadas
  const metrics = useMemo(() => {
    const totalStudents = initialData.length;
    const totalCertificates = initialData.reduce(
      (sum, s) => sum + s.totalCertificadosEmitidos,
      0
    );
    const totalHours = initialData.reduce(
      (sum, s) => sum + s.totalHorasAcumuladas,
      0
    );
    const avgHours =
      totalStudents > 0 ? Math.round(totalHours / totalStudents) : 0;

    return { totalStudents, totalCertificates, totalHours, avgHours };
  }, [initialData]);

  // Filtragem
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return initialData;
    return initialData.filter(
      (s) =>
        s.studentName.toLowerCase().includes(term) ||
        s.studentEmail.toLowerCase().includes(term)
    );
  }, [initialData, search]);

  // Ordenação
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === "studentName") {
        comparison = a.studentName.localeCompare(b.studentName, "pt-BR");
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset da página ao mudar filtro/busca
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
      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Total de Alunos"
          value={metrics.totalStudents}
        />
        <MetricCard
          icon={<Award className="w-5 h-5 text-green-500" />}
          label="Certificados Emitidos"
          value={metrics.totalCertificates}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-purple-500" />}
          label="Horas Totais"
          value={`${metrics.totalHours}h`}
        />
        <MetricCard
          icon={<GraduationCap className="w-5 h-5 text-amber-500" />}
          label="Média por Aluno"
          value={`${metrics.avgHours}h`}
        />
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por nome ou e-mail do aluno..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Tabela */}
      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-zinc-600 dark:text-zinc-400">
            {search
              ? "Nenhum aluno encontrado para a busca realizada."
              : "Nenhum dado de horas extracurriculares disponível."}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("studentName")}
                    >
                      <span className="flex items-center">
                        Nome
                        <SortIcon field="studentName" />
                      </span>
                    </th>
                    <th
                      className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("totalCertificadosEmitidos")}
                    >
                      <span className="flex items-center justify-center">
                        Certificados
                        <SortIcon field="totalCertificadosEmitidos" />
                      </span>
                    </th>
                    <th
                      className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort("totalHorasAcumuladas")}
                    >
                      <span className="flex items-center justify-center">
                        Horas Acumuladas
                        <SortIcon field="totalHorasAcumuladas" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
                  {paginated.map((student) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              {student.studentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {student.studentEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">
                          {student.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                          <Award className="w-3.5 h-3.5" />
                          {student.totalCertificadosEmitidos}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Clock className="w-3.5 h-3.5" />
                          {student.totalHorasAcumuladas}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-700">
              {paginated.map((student) => (
                <div
                  key={student.studentId}
                  className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {student.studentName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        {student.studentName}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {student.studentEmail}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                      <Award className="w-3.5 h-3.5" />
                      {student.totalCertificadosEmitidos} certificados
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      <Clock className="w-3.5 h-3.5" />
                      {student.totalHorasAcumuladas}h
                    </span>
                  </div>
                </div>
              ))}
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
                alunos
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

// Componente de card de métrica
function MetricCard({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
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
        </div>
      </div>
    </div>
  );
}
