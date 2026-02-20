import { render, screen, fireEvent } from "@testing-library/react";
import EventsContent from "../EventsContent";
import { Event } from "@/types/event";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => children,
  };
});

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Workshop React",
    description: "Aprenda React",
    category: "workshop",
    date: "2030-01-01",
    startTime: "10:00",
    endTime: "12:00",
    location: "Lab 1",
    campus: "ondina",
    speakers: [],
    capacity: 10,
    registered: 0,
    requirements: [],
    organizer: "TI",
    organizerType: "Dep",
    tags: ["react"],
    isRegistered: false,
  },
  {
    id: "2",
    title: "Palestra História",
    description: "História do Brasil",
    category: "palestra",
    date: "2020-01-01",
    startTime: "10:00",
    endTime: "12:00",
    location: "Auditorio",
    campus: "reitoria",
    speakers: [],
    capacity: 10,
    registered: 10,
    requirements: [],
    organizer: "Hist",
    organizerType: "Dep",
    tags: ["historia"],
    isRegistered: false,
  },
];

describe("EventsContent Integration", () => {
  it("deve renderizar a lista inicial de eventos futuros (Tab Padrão: Próximos)", () => {
    render(<EventsContent initialEvents={mockEvents} />);

    expect(screen.getByText("Workshop React")).toBeInTheDocument();

    expect(screen.queryByText("Palestra História")).not.toBeInTheDocument();
  });

  it("deve filtrar eventos pelo texto de busca", () => {
    render(<EventsContent initialEvents={mockEvents} />);

    const searchInput = screen.getByPlaceholderText(
      /busca por palavras chave/i,
    );

    fireEvent.change(searchInput, { target: { value: "XYZ" } });
    expect(screen.queryByText("Workshop React")).not.toBeInTheDocument();
    expect(screen.getByText(/eventos não encontrados/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "React" } });
    expect(screen.getByText("Workshop React")).toBeInTheDocument();
  });

  it("deve filtrar por categoria", () => {
    render(<EventsContent initialEvents={mockEvents} />);

    const categorySelect = screen.getByLabelText(/categoria/i);

    fireEvent.change(categorySelect, { target: { value: "palestra" } });

    expect(screen.queryByText("Palestra História")).not.toBeInTheDocument();

    const todosTab = screen.getByRole("button", { name: /todos os eventos/i });
    fireEvent.click(todosTab);

    expect(screen.getByText("Palestra História")).toBeInTheDocument();
  });

  it("deve limpar todos os filtros ao clicar no botão de reset", () => {
    render(<EventsContent initialEvents={mockEvents} />);

    const searchInput = screen.getByPlaceholderText(
      /busca por palavras chave/i,
    );
    fireEvent.change(searchInput, { target: { value: "NadaExiste" } });

    expect(screen.getByText(/eventos não encontrados/i)).toBeInTheDocument();

    const clearButton = screen.getByRole("button", { name: /limpar filtros/i });
    fireEvent.click(clearButton);

    expect(screen.getByText("Workshop React")).toBeInTheDocument();
    expect((searchInput as HTMLInputElement).value).toBe("");
  });

  it("deve ocultar eventos lotados especificamente quando na aba Disponíveis", () => {
    const fullEvent = {
      ...mockEvents[0],
      id: "full",
      capacity: 10,
      registered: 10,
      title: "Evento Lotado",
    };
    const availableEvent = {
      ...mockEvents[0],
      id: "avail",
      capacity: 10,
      registered: 5,
      title: "Evento Livre",
    };

    render(<EventsContent initialEvents={[fullEvent, availableEvent]} />);

    const tabBtn = screen.getByRole("button", { name: /disponíveis/i });
    fireEvent.click(tabBtn);

    expect(screen.queryByText("Evento Lotado")).not.toBeInTheDocument();
    expect(screen.getByText("Evento Livre")).toBeInTheDocument();
  });
});
