"use server";

import { cookies } from "next/headers";
import { StudentHoursDTO } from "@/types/studentHours";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function getAllStudentHours(): Promise<StudentHoursDTO[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return [];

    const response = await fetch(`${API_URL}/extracurricular-hours/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro ao buscar horas extracurriculares:", response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na getAllStudentHours:", error);
    return [];
  }
}
