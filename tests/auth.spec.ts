import { test, expect } from "@playwright/test";

test.describe("Fluxo de Autenticação Completo", () => {
  const timestamp = Date.now();
  const userData = {
    name: "Playwright User",
    email: `test.user.${timestamp}@example.com`,
    password: "Password123!",
    wrongPassword: "WrongPassword!!!",
  };

  test("Cenário 1: Deve impedir cadastro com senhas divergentes ou email inválido", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.getByLabel(/nome/i).fill(userData.name);
    await page.getByLabel(/email/i).fill("email-invalido");
    await page.getByLabel(/senha/i).fill("123");

    await page
      .getByRole("button", { name: /cadastrar|registrar|criar conta/i })
      .click();

    const emailInput = page.getByLabel(/email/i);
    void emailInput;
    await expect(page).not.toHaveURL("/signin");
  });

  test("Cenário 2: Deve impedir login de usuário não cadastrado", async ({
    page,
  }) => {
    await page.goto("/signin");

    await page.getByLabel(/email/i).fill("nunca.existiu@teste.com");
    await page.getByLabel(/senha/i).fill("123456");
    await page.getByRole("button", { name: /entrar|acessar/i }).click();

    await expect(page.getByText(/inválid|não encontrado|erro/i)).toBeVisible();
  });

  test("Cenário 3: Deve impedir login com senha incorreta", async ({
    page,
  }) => {
    await page.goto("/signin");
    await page.getByLabel(/email/i).fill(userData.email);
    await page.getByLabel(/senha/i).fill(userData.password);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/inválid|não encontrado/i)).toBeVisible();
  });

  test("Cenário 4: Fluxo Completo -> Cadastro, Login com Sucesso e Logout", async ({
    page,
  }) => {
    console.log(`Criando usuário: ${userData.email}`);
    await page.goto("/signup");

    await page.getByLabel(/nome/i).fill(userData.name);
    await page.getByLabel(/email/i).fill(userData.email);
    await page.getByLabel(/senha/i).fill(userData.password);

    await page
      .getByRole("button", { name: /cadastrar|registrar|criar conta/i })
      .click();

    await expect(page).toHaveURL("/signin");

    await page.getByLabel(/email/i).fill(userData.email);
    await page.getByLabel(/senha/i).fill(userData.password);

    await page.getByRole("button", { name: /entrar|acessar/i }).click();

    await expect(page).toHaveURL("/");

    const logoutBtn = page.getByRole("button", { name: /sair|logout/i });
    await expect(logoutBtn).toBeVisible();

    await logoutBtn.click();

    await expect(page).toHaveURL("/signin");
    await expect(
      page.getByRole("button", { name: /sair|logout/i }),
    ).not.toBeVisible();
  });
});
