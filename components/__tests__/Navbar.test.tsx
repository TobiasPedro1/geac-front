import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "../Navbar";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as AuthContext from "@/contexts/AuthContext";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const useAuthSpy = vi.spyOn(AuthContext, "useAuth");

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mostrar botões de Login/Cadastro quando NÃO autenticado", () => {
    useAuthSpy.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.getByText("Cadastrar")).toBeInTheDocument();
    expect(screen.queryByText("Sair")).not.toBeInTheDocument();
  });

  it("deve mostrar Menu do Usuário e Logout quando autenticado", () => {
    useAuthSpy.mockReturnValue({
      isAuthenticated: true,
      user: {
        //@ts-expect-error - id é opcional, mas para o teste precisamos
        id: "1",
        name: "Dev Teste",
        email: "dev@test.com",
        role: "STUDENT",
      },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText("Dev Teste")).toBeInTheDocument();
    expect(screen.getByText("Meus Eventos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it('deve chamar logout e mudar texto para "Saindo..." ao clicar em Sair', async () => {
    const mockLogout = vi.fn().mockResolvedValue(true);

    useAuthSpy.mockReturnValue({
      isAuthenticated: true,
      //@ts-expect-error - id é opcional, mas para o teste precisamos
      user: { id: "1", name: "User", email: "u@u.com", role: "STUDENT" },
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
    });

    render(<Navbar />);

    const logoutBtn = screen.getByRole("button", { name: "Sair" });
    fireEvent.click(logoutBtn);

    expect(screen.getByRole("button")).toHaveTextContent("Saindo...");
    expect(mockLogout).toHaveBeenCalled();
  });

  it('deve resetar o estado de "Saindo..." quando a prop isAuthenticated mudar', async () => {
    useAuthSpy.mockReturnValue({
      isAuthenticated: true,
      //@ts-expect-error - id é opcional, mas para o teste precisamos
      user: { id: "1", name: "User" },
      logout: vi.fn(),
    });

    const { rerender } = render(<Navbar />);

    const logoutBtn = screen.getByRole("button", { name: "Sair" });
    fireEvent.click(logoutBtn);
    expect(screen.getByRole("button")).toHaveTextContent("Saindo...");

    //@ts-expect-error - AuthContextType tem mais propriedades, mas para o teste só precisamos dessas
    useAuthSpy.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    rerender(<Navbar />);

    useAuthSpy.mockReturnValue({
      isAuthenticated: true,
      //@ts-expect-error - id é opcional, mas para o teste precisamos
      user: { id: "1", name: "User" },
    });

    rerender(<Navbar />);

    expect(screen.getByRole("button")).toHaveTextContent("Sair");
  });
});
