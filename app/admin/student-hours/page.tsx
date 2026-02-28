import { RoleGuard } from "@/components/auth/RoleGuard";
import { getAllStudentHours } from "@/app/actions/studentHoursActions";
import StudentHoursContent from "./StudentHoursContent";

export const dynamic = "force-dynamic";

export default async function StudentHoursPage() {
  const studentHours = await getAllStudentHours();

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Horas Extracurriculares
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Visualize as horas extracurriculares acumuladas por cada aluno com
              base nos certificados emitidos.
            </p>
          </div>

          <StudentHoursContent initialData={studentHours} />
        </div>
      </div>
    </RoleGuard>
  );
}
