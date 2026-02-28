"use server";

import { cookies } from "next/headers";
import { API_URL } from "./configs";

export async function createRequirementAction(description: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Não autorizado" };

  try {
    const res = await fetch(`${API_URL}/requirements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message || "Erro ao criar requisito" };
    }

    return await res.json();
  } catch (error) {
    console.error("Erro ao criar requisito:", error);
    return { error: "Erro de conexão com o servidor" };
  }
}
