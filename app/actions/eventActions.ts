"use server";

import { cookies } from "next/headers";
import {
  EventRequestDTO,
  EventPatchRequestDTO,
  EventResponseDTO,
} from "@/types/event";

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

export async function updateEventAction(
  id: string,
  data: EventPatchRequestDTO,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Não autorizado. Faça login novamente." };
  }

  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "PATCH",
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
        error: errorData.message || "Erro ao atualizar evento.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na atualização do evento:", error);
    return { success: false, error: "Erro de conexão com o servidor." };
  }
}

export async function deleteEventAction(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Não autorizado. Faça login novamente." };
  }

  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Erro ao excluir evento.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na exclusão do evento:", error);
    return { success: false, error: "Erro de conexão com o servidor." };
  }
}

export async function getAllEventsAction(): Promise<EventResponseDTO[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return [];
  }
}

export async function getEventByIdAction(
  id: string,
): Promise<EventResponseDTO | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    return null;
  }
}
