import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { loginAction, logoutAction, registerAction } from "../auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

global.fetch = vi.fn();

describe("Auth Actions", () => {
  const mockCookieStore = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as unknown as Mock).mockResolvedValue(mockCookieStore);
  });

  describe("loginAction", () => {
    it("deve setar o cookie e redirecionar em caso de sucesso", async () => {
      (global.fetch as unknown as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ token: "fake-token" }),
      });

      await loginAction({ email: "a@a.com", password: "123" });

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "token",
        "fake-token",
        expect.any(Object),
      );
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("deve retornar erro se a API falhar", async () => {
      (global.fetch as unknown as Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Senha errada" }),
      });

      const result = await loginAction({ email: "a@a.com", password: "123" });

      expect(result).toEqual({ error: "Senha errada" });
      expect(mockCookieStore.set).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("logoutAction", () => {
    it("deve deletar o cookie e redirecionar", async () => {
      mockCookieStore.get.mockReturnValue({ value: "old-token" });

      (global.fetch as unknown as Mock).mockResolvedValue({ ok: true });

      await logoutAction();

      expect(mockCookieStore.delete).toHaveBeenCalledWith("token");
      expect(redirect).toHaveBeenCalledWith("/signin");
    });

    it("deve realizar logout local (cookie) mesmo se o backend retornar erro", async () => {
      mockCookieStore.get.mockReturnValue({ value: "valid-token" });

      (global.fetch as unknown as Mock).mockRejectedValue(
        new Error("Network Error no Backend"),
      );

      await logoutAction();

      expect(mockCookieStore.delete).toHaveBeenCalledWith("token");
      expect(redirect).toHaveBeenCalledWith("/signin");
    });
  });

  describe("registerAction", () => {
    it("deve redirecionar para /signin em caso de sucesso", async () => {
      (global.fetch as unknown as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ message: "Success" }),
      });

      await registerAction({
        name: "Test",
        email: "t@t.com",
        password: "123",
        role: "STUDENT",
      });

      expect(redirect).toHaveBeenCalledWith("/signin");
    });

    it("deve retornar erro se a API falhar", async () => {
      (global.fetch as unknown as Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Email já existe" }),
      });

      const result = await registerAction({
        name: "Test",
        email: "exists@t.com",
        password: "123",
        role: "STUDENT",
      });

      expect(result).toEqual({ error: "Email já existe" });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("deve tratar erros de rede/exception", async () => {
      (global.fetch as unknown as Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const result = await registerAction({
        name: "Test",
        email: "t@t.com",
        password: "123",
        role: "STUDENT",
      });

      expect(result).toEqual({
        error: expect.stringContaining("Servidor indisponível"),
      });
    });

    it("deve lidar com resposta de erro não-JSON (ex: HTML 500) graciosamente", async () => {
      (global.fetch as unknown as Mock).mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("Unexpected token < in JSON");
        },
      });

      const result = await registerAction({
        name: "Test",
        email: "t@t.com",
        password: "123",
        role: "STUDENT",
      });

      expect(result).toEqual({
        error: "Erro ao criar conta. Tente novamente.",
      });
    });
  });
});
