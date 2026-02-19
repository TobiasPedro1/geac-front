import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "../page";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as AuthActions from "@/app/actions/auth";
import { ButtonProps } from "@/components/LoadingButton";

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <a href="#">{children}</a>
  ),
}));

vi.mock("@/components/LoadingButton", () => ({
  LoadingButton: ({ children, isLoading, ...props }: Readonly<ButtonProps>) => (
    <button {...props} disabled={isLoading}>
      {isLoading ? "Carregando..." : children}
    </button>
  ),
}));

vi.mock("@/app/actions/auth", () => ({
  registerAction: vi.fn(),
}));

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve chamar a action de registro com os dados corretos", async () => {
    const user = userEvent.setup();

    (AuthActions.registerAction as unknown as Mock).mockResolvedValue(
      undefined,
    );

    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/nome/i), "Novo Aluno");
    await user.type(screen.getByLabelText(/email/i), "aluno@teste.com");
    await user.type(screen.getByLabelText(/senha/i), "123456");

    const submitBtn = screen.getByRole("button", { name: /registrar/i });
    await user.click(submitBtn);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    await waitFor(() => {
      expect(AuthActions.registerAction).toHaveBeenCalledWith({
        name: "Novo Aluno",
        email: "aluno@teste.com",
        password: "123456",
        role: "STUDENT",
      });
    });
  });

  it("deve exibir mensagem de erro se o registro falhar", async () => {
    const user = userEvent.setup();

    (AuthActions.registerAction as unknown as Mock).mockResolvedValue({
      error: "Email duplicado",
    });

    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/nome/i), "Teste");
    await user.type(screen.getByLabelText(/email/i), "erro@teste.com");
    await user.type(screen.getByLabelText(/senha/i), "123");

    await user.click(screen.getByRole("button", { name: /registrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Email duplicado")).toBeInTheDocument();
    });

    expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /registrar/i }),
    ).not.toBeDisabled();
  });
});
