"use server";

import { EvaluationResponseDTO } from "@/types/evaluations";
import { OrganizerResponseDTO } from "@/types/organizer";
import { cookies } from "next/headers";
const API_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

async function fetchDomain(endpoint: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return [];

  try {
    if (endpoint === "/organizers/user/me") {
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = Buffer.from(payloadBase64, "base64").toString(
        "utf-8",
      );
      const { id } = JSON.parse(decodedPayload);
      endpoint = endpoint.replace("me", String(id));
    }
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error);
    return [];
  }
}

export async function getCategories() {
  return fetchDomain("/categories");
}
export async function getLocations() {
  return fetchDomain("/locations");
}
export async function getRequirements() {
  return fetchDomain("/requirements");
}
export async function getTags() {
  return fetchDomain("/tags");
}

export async function getOrganizers(): Promise<OrganizerResponseDTO[]> {
  return fetchDomain("/organizers");
}

export async function getSpeakers(): Promise<{ id: number; name: string }[]> {
  return fetchDomain("/speakers");
}

export async function getUserOrganizers(): Promise<OrganizerResponseDTO[]> {
  return fetchDomain("/organizers/user/me");
}

// export async function getSpeakers() {
//   return fetchDomain("/speakers");
// }

export async function getEventEvaluations(
  eventId: string,
): Promise<EvaluationResponseDTO[]> {
  return fetchDomain(`/evaluation/${eventId}`);
}
