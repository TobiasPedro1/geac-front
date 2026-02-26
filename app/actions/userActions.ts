"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface CreateOrganizerRequestDTO {
  userId: string;
  organizerId: string;
  justification: string;
}

export async function createOrganizerRequestAction(
  payload: CreateOrganizerRequestDTO,
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Sua sessão expirou. Faça login novamente." };
    }

    const response = await fetch(`${API_URL}/organizer-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        error:
          errorData?.message ||
          `Erro ao enviar solicitação: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na createOrganizerRequestAction:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}
