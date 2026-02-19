import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: mocks.cookieGet,
    }),
}));

const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

import { GET } from "../route";

const createFakeToken = (payload: object) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = "dummy_signature";
  return `${header}.${body}.${signature}`;
};

describe("API Route: /api/me (Local Decode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 401 se não houver token no cookie", async () => {
    mocks.cookieGet.mockReturnValue(undefined);

    const res = await GET();

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ user: null });
  });

  it("deve retornar o usuário corretamente decodificado do token (Status 200)", async () => {
    const mockPayload = {
      sub: "user@example.com",
      name: "João Silva",
      role: "STUDENT",
      exp: 9999999999,
    };

    const validToken = createFakeToken(mockPayload);
    mocks.cookieGet.mockReturnValue({ value: validToken });

    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toEqual({
      user: {
        name: "João Silva",
        email: "user@example.com",
        role: "STUDENT",
      },
    });
  });

  it("deve retornar 401 se o token for inválido/malformado (Catch Block)", async () => {
    mocks.cookieGet.mockReturnValue({ value: "invalid-token-string" });

    const res = await GET();

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ user: null });

    expect(consoleSpy).toHaveBeenCalled();
  });
});
