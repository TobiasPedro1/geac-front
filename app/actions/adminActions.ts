"use server";

import { cookies } from "next/headers";
import { OrganizerRequestDTO } from "@/types/organizer";
import { revalidatePath } from "next/cache";
import { PendingRequestDTO } from "@/types/organizationRequests";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function createOrganizerAction(payload: OrganizerRequestDTO) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Acesso negado. Token não encontrado." };
    }

    const response = await fetch(`${API_URL}/organizers`, {
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
        error: errorData?.message || `Erro no servidor: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na createOrganizerAction:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}

export async function approveRequestAction(requestId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Acesso negado. Token não encontrado." };
    }

    const response = await fetch(
      `${API_URL}/organizer-requests/${requestId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        error: errorData?.message || `Erro no servidor: ${response.status}`,
      };
    }

    revalidatePath("/admin/approvals");

    return { success: true };
  } catch (error) {
    console.error("Erro na approveRequestAction:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}

export async function rejectRequestAction(requestId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Acesso negado. Token não encontrado." };
    }

    const response = await fetch(
      `${API_URL}/organizer-requests/${requestId}/reject`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        error: errorData?.message || `Erro no servidor: ${response.status}`,
      };
    }

    revalidatePath("/admin/approvals");

    return { success: true };
  } catch (error) {
    console.error("Erro na rejectRequestAction:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}

export async function getPendingRequests(): Promise<PendingRequestDTO[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return [];

    const response = await fetch(`${API_URL}/organizer-requests/pending`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro ao buscar pendências:", response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na getPendingRequests:", error);
    return [];
  }
}
