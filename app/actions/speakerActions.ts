"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export interface SpeakerQualificationDTO {
  title_name: string;
  institution: string;
}

export interface CreateSpeakerDTO {
  name: string;
  bio?: string;
  email?: string;
  qualifications: SpeakerQualificationDTO[];
}

export async function createSpeakerAction(data: CreateSpeakerDTO) {
  try {
    if (!data.name || data.name.trim() === "") {
      return { error: "O nome do palestrante é obrigatório." };
    }

    const API_URL =
      process.env.API_URL_INTERNAL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080";

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Sessão expirada. Faça login novamente." };
    }

    const payloadBackend = {
      name: data.name,
      bio: data.bio,
      email: data.email,
      qualifications: data.qualifications.map((q) => ({
        titleName: q.title_name,
        institution: q.institution,
      })),
    };

    const response = await fetch(`${API_URL}/speakers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payloadBackend),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        error: errorData?.message || `Falha na API: ${response.status}`,
      };
    }

    const result = await response.json();

    revalidatePath("/events/new");

    return { success: true, speakerId: result.id };
  } catch (error) {
    console.error("Erro no createSpeakerAction:", error);
    return {
      error: "Não foi possível conectar ao servidor para salvar o palestrante.",
    };
  }
}
