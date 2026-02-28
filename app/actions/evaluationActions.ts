"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export async function submitEvaluationAction(
  eventId: string,
  rating: number,
  comment: string,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Não autorizado. Faça login." };

  try {
    const res = await fetch(`${API_URL}/evaluation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId, rating, comment }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message || "Erro ao enviar avaliação." };
    }

    revalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao avaliar:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}
