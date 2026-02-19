import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { eventService } from "../eventService";

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => {
      if (name === "token") return { value: "fake-jwt-token" };
      return undefined;
    },
  }),
}));

global.fetch = vi.fn();

const mockEventsResponse = [
  { id: "1", title: "Evento 1" },
  { id: "2", title: "Evento 2" },
];

describe("eventService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllEvents deve chamar a API corretamente com o token", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockEventsResponse,
    });

    const events = await eventService.getAllEvents();

    expect(events).toEqual(mockEventsResponse);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-jwt-token",
        }),
      }),
    );
  });

  it("deve lançar erro se a API falhar", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
    });

    await expect(eventService.getAllEvents()).rejects.toThrow(
      "Falha ao buscar eventos",
    );
  });

  it("getEventById deve buscar um evento específico pelo ID", async () => {
    const mockEvent = { id: "123", title: "Evento Único" };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockEvent,
    });

    const event = await eventService.getEventById("123");

    expect(event).toEqual(mockEvent);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events/123"),
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("getEventById deve lançar erro se o evento não for encontrado", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(eventService.getEventById("999")).rejects.toThrow(
      "Evento não encontrado",
    );
  });
});
