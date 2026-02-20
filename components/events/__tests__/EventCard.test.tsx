import { render, screen } from "@testing-library/react";
import { EventCard } from "../EventCard";
import { Event, EventCategory } from "@/types/event";
import { describe, it, expect } from "vitest";

const mockEvent: Event = {
  id: "1",
  title: "Evento Teste React",
  description: "Descrição do evento teste",
  category: "workshop",
  date: "2026-05-20",
  startTime: "10:00",
  endTime: "12:00",
  location: "Lab 1",
  campus: "ondina",
  speakers: ["Dev Tester"],
  capacity: 100,
  registered: 10,
  requirements: [],
  organizer: "Departamento de TI",
  organizerType: "Departamento",
  tags: ["react", "test"],
  isRegistered: false,
};

const baseEvent: Event = {
  id: "1",
  title: "Evento Teste",
  description: "Desc",
  category: "outro",
  date: "2026-05-20",
  startTime: "10:00",
  endTime: "12:00",
  location: "Local",
  campus: "ondina",
  speakers: [],
  capacity: 100,
  registered: 10,
  requirements: [],
  organizer: "Org",
  organizerType: "Dep",
  tags: [],
  isRegistered: false,
};

describe("EventCard Component", () => {
  it("deve renderizar o título e descrição corretamente", () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText("Evento Teste React")).toBeInTheDocument();
    expect(screen.getByText("Descrição do evento teste")).toBeInTheDocument();
    expect(screen.getByText("workshop")).toBeInTheDocument();
  });

  it('deve exibir o botão "Ver Detalhes"', () => {
    render(<EventCard event={mockEvent} />);

    const link = screen.getByRole("link", { name: /ver detalhes/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/events/1");
  });

  it('deve mostrar o badge "Inscrito" quando a prop isRegistered for true', () => {
    const registeredEvent = { ...mockEvent, isRegistered: true };
    render(<EventCard event={registeredEvent} />);

    expect(screen.getByText("Inscrito")).toBeInTheDocument();
  });

  it('NÃO deve mostrar o badge "Inscrito" quando a prop isRegistered for false', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.queryByText("Inscrito")).not.toBeInTheDocument();
  });

  it.each([
    { category: "palestra", expectedClass: "bg-blue-100" },
    { category: "seminario", expectedClass: "bg-lime-100" },
    { category: "cultural", expectedClass: "bg-purple-100" },
    { category: "feira", expectedClass: "bg-fuchsia-100" },
    { category: "workshop", expectedClass: "bg-pink-100" },
    { category: "conferencia", expectedClass: "bg-orange-100" },
    { category: "festival", expectedClass: "bg-rose-100" },
    { category: "livre", expectedClass: "bg-cyan-100" },
    { category: "outro", expectedClass: "bg-gray-100" },
  ])(
    "deve aplicar a classe de cor correta para a categoria $category",
    ({ category, expectedClass }) => {
      const event = { ...baseEvent, category: category as EventCategory };
      render(<EventCard event={event} />);

      const badge = screen.getByText(category);
      expect(badge).toHaveClass(expectedClass);
    },
  );

  it('deve exibir o badge "Poucas vagas" quando restarem menos de 20 vagas', () => {
    const eventFewSpots = {
      ...baseEvent,
      capacity: 100,
      registered: 85,
    };
    render(<EventCard event={eventFewSpots} />);

    expect(screen.getByText("Poucas vagas")).toBeInTheDocument();
  });

  it('NÃO deve exibir o badge "Poucas vagas" quando estiver cheio ou vazio', () => {
    const eventPlentySpots = {
      ...baseEvent,
      capacity: 100,
      registered: 50,
    };
    render(<EventCard event={eventPlentySpots} />);

    expect(screen.queryByText("Poucas vagas")).not.toBeInTheDocument();
  });
});
