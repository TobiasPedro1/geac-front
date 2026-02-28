"use server";

import { cookies } from "next/headers";
import { EventStatisticsDTO } from "@/types/eventStatistics";
import { API_URL } from "./configs";

export async function getAllEventStatistics(): Promise<EventStatisticsDTO[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return [];

    const response = await fetch(`${API_URL}/views/eventstatistics`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro ao buscar estatísticas de eventos:", response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na getAllEventStatistics:", error);
    return [];
  }
}
