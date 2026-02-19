import { cookies } from "next/headers";
import { Event } from "@/types/event";
import { mockEvents } from "@/data/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API_URL}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      // TODO retornar mock de eventos até que o backend esteja funcionando
      console.warn("Falha ao buscar eventos. Retornando dados mockados.");
      return mockEvents;
      throw new Error("Falha ao buscar eventos");
    }

    return res.json();
  },

  getEventById: async (id: string): Promise<Event> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API_URL}/events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) {
      // TODO retornar mock de eventos até que o backend esteja funcionando
      const mockEvent = mockEvents.find((event) => event.id === id);
      if (mockEvent) {
        console.warn(`Falha ao buscar evento ${id}. Retornando dados mockados.`);
        return mockEvent;
      }
      throw new Error("Evento não encontrado");
    }

    return res.json();
  },
};
