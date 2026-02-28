"use server";

import { cookies } from "next/headers";

const API_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export interface NotificationResponseDTO {
  id: number;
  userId: string;
  eventId: string;
  eventTitle: string;
  isRead: boolean;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

async function getHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getUnreadCount(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/notifications/unread/count`, {
      headers: await getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return 0;
    return await res.json();
  } catch (error) {
    void error;
    return 0;
  }
}

export async function getUnreadNotifications(): Promise<
  NotificationResponseDTO[]
> {
  try {
    const res = await fetch(`${API_URL}/notifications/unread`, {
      headers: await getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    void error;
    return [];
  }
}

export async function markAsRead(id: number) {
  try {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: await getHeaders(),
    });
  } catch (error) {
    console.error("Erro ao marcar como lido", error);
  }
}

export async function markAllAsRead() {
  try {
    await fetch(`${API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: await getHeaders(),
    });
  } catch (error) {
    console.error("Erro ao marcar todas como lidas", error);
  }
}
