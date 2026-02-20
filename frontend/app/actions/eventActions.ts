"use server";

import { cookies } from "next/headers";
import { EventRequestDTO } from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function createEventAction(data: EventRequestDTO) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Não autorizado. Faça login novamente." };
  }

  try {
    const response = await fetch(`${API_URL}/events/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Erro ao criar evento.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na criação do evento:", error);
    return { success: false, error: "Erro de conexão com o servidor." };
  }
}
