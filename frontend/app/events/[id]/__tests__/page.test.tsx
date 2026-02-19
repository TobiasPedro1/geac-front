import { render, screen } from "@testing-library/react";
import EventDetails from "../page";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { eventService } from "@/services/eventService";
import { notFound } from "next/navigation";

vi.mock("@/services/eventService", () => ({
  eventService: {
    getEventById: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <a href="#">{children}</a>
  ),
}));

vi.mock("@/components/events/EventRegistrationButton", () => ({
  EventRegistrationButton: () => <button>Botão Mockado</button>,
}));

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="icon-arrow" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Clock: () => <span data-testid="icon-clock" />,
  MapPin: () => <span data-testid="icon-pin" />,
  Building: () => <span data-testid="icon-building" />,
  Users: () => <span data-testid="icon-users" />,
  CheckCircle: () => <span data-testid="icon-check" />,
  Tag: () => <span data-testid="icon-tag" />,
}));

const baseEvent = {
  id: "1",
  title: "Evento Teste",
  description: "Descrição",
  date: "2026-01-01",
  startTime: "10:00",
  endTime: "12:00",
  location: "Local",
  campus: "Campus A",
  speakers: ["Speaker 1"],
  capacity: 100,
  registered: 10,
  requirements: ["Req 1"],
  organizer: "Org",
  organizerType: "Tipo",
  tags: ["tag1"],
  isRegistered: false,
  category: "workshop",
};

describe("EventDetails Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar as informações principais do evento", async () => {
    (eventService.getEventById as unknown as Mock).mockResolvedValue(baseEvent);

    const params = Promise.resolve({ id: "1" });

    const jsx = await EventDetails({ params });
    render(jsx);

    expect(screen.getByText("Evento Teste")).toBeInTheDocument();
    expect(screen.getByText("Campus A Campus")).toBeInTheDocument();
  });

  const categories = [
    { type: "workshop", expectedClass: "bg-pink-100" },
    // { type: "palestra", expectedClass: "bg-blue-100" },
    { type: "seminario", expectedClass: "bg-green-100" },
    { type: "cultural", expectedClass: "bg-purple-100" },
    // { type: "feira", expectedClass: "bg-fuchsia-100" },
    { type: "conferencia", expectedClass: "bg-orange-100" },
    { type: "festival", expectedClass: "bg-rose-100" },
    { type: "desconhecido", expectedClass: "bg-gray-100" },
  ];

  it.each(categories)(
    "deve aplicar a classe correta ($expectedClass) para a categoria $type",
    async ({ type, expectedClass }) => {
      (eventService.getEventById as unknown as Mock).mockResolvedValue({
        ...baseEvent,
        category: type,
      });

      const params = Promise.resolve({ id: "1" });

      const jsx = await EventDetails({ params });
      render(jsx);

      const categoryBadge = screen.getByText(new RegExp(type, "i"));

      expect(categoryBadge).toHaveClass(expectedClass);
    },
  );

  it("deve mostrar o badge 'Inscrito' quando o usuário já estiver registrado", async () => {
    (eventService.getEventById as unknown as Mock).mockResolvedValue({
      ...baseEvent,
      isRegistered: true,
    });

    const params = Promise.resolve({ id: "1" });

    const jsx = await EventDetails({ params });
    render(jsx);

    expect(screen.getByText("Inscrito")).toBeInTheDocument();
  });

  it("deve chamar notFound() se o serviço falhar", async () => {
    (eventService.getEventById as unknown as Mock).mockRejectedValue(
      new Error("Não encontrado"),
    );

    const params = Promise.resolve({ id: "999" });

    try {
      await EventDetails({ params });
    } catch (e) {
      void e;
    }

    expect(notFound).toHaveBeenCalled();
  });
});
