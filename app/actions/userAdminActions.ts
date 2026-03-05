"use server";

import { cookies } from "next/headers";
import { UserPatchRequestDTO, UserResponseDTO } from "@/types/user";
import { revalidatePath } from "next/cache";
import { API_URL } from "./configs";

export async function getUsersAction(): Promise<UserResponseDTO[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return [];

    const response = await fetch(`${API_URL}/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error("Erro na getUsersAction:", error);
    return [];
  }
}

export async function updateUserAction(id: string, payload: UserPatchRequestDTO) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return { error: "Acesso negado. Token não encontrado." };

    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { error: errorData?.message || `Erro no servidor: ${response.status}` };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Erro na updateUserAction:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return { error: "Acesso negado. Token não encontrado." };

    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { error: errorData?.message || `Erro no servidor: ${response.status}` };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Erro na deleteUserAction:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}