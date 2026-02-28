"use server";

import { cookies } from "next/headers";
import { Certificate } from "@/types/certificate";

const API_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export async function getMyCertificates(): Promise<{
  data?: Certificate[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Usuário não autenticado." };
    }

    const response = await fetch(`${API_URL}/certificate/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      //uso cache 'no-store' para garantir que sempre mostre os mais recentes
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "Não foi possível carregar os certificados." };
    }

    const data: Certificate[] = await response.json();
    return { data };
  } catch (error) {
    console.error("Erro ao buscar certificados:", error);
    return { error: "Erro de conexão com o servidor." };
  }
}
