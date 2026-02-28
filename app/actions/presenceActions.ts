"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { RegistrationResponseDTO } from "@/types/event";

const API_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8080";

export async function getEventRegistrationsAction(
  eventId: string,
): Promise<RegistrationResponseDTO[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Acesso negado. Faça login.");

  const res = await fetch(`${API_URL}/registrations/event/${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Lista de presença precisa estar sempre atualizada
  });

  if (!res.ok) {
    throw new Error(
      "Erro ao buscar lista de presença. Verifique se você é o organizador deste evento.",
    );
  }

  return res.json();
}

export async function saveBulkAttendanceAction(
  eventId: string,
  userIds: string[],
  attended: boolean,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Acesso negado. Faça login.");

  const res = await fetch(
    `${API_URL}/registrations/${eventId}/attendance/bulk`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userIds,
        attended,
      }),
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao salvar presenças.");
  }

  // Atualiza o cache da página de presença para refletir as mudanças instantaneamente
  revalidatePath(`/events/${eventId}/attendance`);
}
