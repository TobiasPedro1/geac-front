"use server";

import { cookies } from "next/headers";
import { OrganizationEngagementDTO } from "@/types/organizationEngagement";
import { API_URL } from "./configs";

export async function getAllOrganizationEngagement(): Promise<
  OrganizationEngagementDTO[]
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return [];

    const response = await fetch(`${API_URL}/views/organization-engagement`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Erro ao buscar engajamento de organizações:",
        response.status,
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na getAllOrganizationEngagement:", error);
    return [];
  }
}
