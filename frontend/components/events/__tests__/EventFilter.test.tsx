import { render, screen, fireEvent } from "@testing-library/react";
import { EventFilter } from "../EventFilter";
import { describe, it, expect, vi } from "vitest";

describe("EventFilter Component", () => {
  it("deve chamar as funções de set quando os inputs mudam", () => {
    const mockSetSearchTerm = vi.fn();
    const mockSetSelectedCategory = vi.fn();

    render(
      <EventFilter
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        selectedCategory=""
        setSelectedCategory={mockSetSelectedCategory}
        selectedCampus=""
        setSelectedCampus={vi.fn()}
        selectedDate=""
        setSelectedDate={vi.fn()}
      />,
    );

    const searchInput = screen.getByLabelText(/palavras chave/i);
    fireEvent.change(searchInput, { target: { value: "Novo Termo" } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith("Novo Termo");

    const categorySelect = screen.getByLabelText(/categoria/i);
    fireEvent.change(categorySelect, { target: { value: "workshop" } });
    expect(mockSetSelectedCategory).toHaveBeenCalledWith("workshop");
  });

  it("deve chamar as funções de set para TODOS os inputs", () => {
    const mockSetSearchTerm = vi.fn();
    const mockSetSelectedCategory = vi.fn();
    const mockSetSelectedCampus = vi.fn();
    const mockSetSelectedDate = vi.fn();

    render(
      <EventFilter
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        selectedCategory=""
        setSelectedCategory={mockSetSelectedCategory}
        selectedCampus=""
        setSelectedCampus={mockSetSelectedCampus}
        selectedDate=""
        setSelectedDate={mockSetSelectedDate}
      />,
    );

    fireEvent.change(screen.getByLabelText(/palavras chave/i), {
      target: { value: "React" },
    });
    expect(mockSetSearchTerm).toHaveBeenCalledWith("React");

    fireEvent.change(screen.getByLabelText(/categoria/i), {
      target: { value: "workshop" },
    });
    expect(mockSetSelectedCategory).toHaveBeenCalledWith("workshop");

    fireEvent.change(screen.getByLabelText(/campus/i), {
      target: { value: "ondina" },
    });
    expect(mockSetSelectedCampus).toHaveBeenCalledWith("ondina");

    fireEvent.change(screen.getByLabelText(/data do evento/i), {
      target: { value: "2026-12-25" },
    });
    expect(mockSetSelectedDate).toHaveBeenCalledWith("2026-12-25");
  });
});
