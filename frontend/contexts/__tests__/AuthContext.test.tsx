import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

global.fetch = vi.fn();

vi.mock("@/app/actions/auth", () => ({
  logoutAction: vi.fn(),
}));

const TestComponent = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  if (isLoading) return <div>Carregando...</div>;
  if (isAuthenticated) {
    return (
      <div>
        <p>Logado como: {user?.name}</p>
        <button onClick={logout}>Sair</button>
      </div>
    );
  }
  return <div>Não logado</div>;
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve iniciar como não autenticado se a API retornar erro/401", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({ ok: false });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Não logado")).toBeInTheDocument();
    });
  });

  it("deve autenticar o usuário se a API retornar sucesso", async () => {
    const mockUser = {
      id: "1",
      name: "Jester",
      email: "test@test.com",
      role: "STUDENT",
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Logado como: Jester")).toBeInTheDocument();
    });
  });

  it("deve limpar o estado ao fazer logout", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { name: "Jester" } }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Logado como: Jester")).toBeInTheDocument(),
    );

    const logoutBtn = screen.getByText("Sair");

    await act(async () => {
      logoutBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText("Não logado")).toBeInTheDocument();
    });
  });

  it("deve tratar erro de parse JSON (ex: resposta HTML inesperada)", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Não logado")).toBeInTheDocument();
    });
  });

  it("deve tratar exceções de rede (Network Error) durante a verificação de sessão", async () => {
    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network Error"),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Não logado")).toBeInTheDocument();
    });
  });
});
