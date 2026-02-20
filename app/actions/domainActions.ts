"use server";

import { cookies } from "next/headers";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchDomain(endpoint: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return [];

  try {
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
export async function getTags(){
  return fetchDomain("/tags");
}
