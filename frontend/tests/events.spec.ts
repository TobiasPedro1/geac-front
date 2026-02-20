import { test, expect } from "@playwright/test";

test.describe("Fluxo de Eventos (Área Protegida)", () => {
  const userEmail = `event.tester.${Date.now()}@example.com`;
  const userPass = "EventPass123!";

  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel(/nome/i).fill("Event Tester");
    await page.getByLabel(/email/i).fill(userEmail);
    await page.getByLabel(/senha/i).fill(userPass);
    await page
      .getByRole("button", { name: /cadastrar|registrar|criar/i })
      .click();

    await page.waitForURL("/signin");
    await page.getByLabel(/email/i).fill(userEmail);
    await page.getByLabel(/senha/i).fill(userPass);
    await page.getByRole("button", { name: /entrar|acessar/i }).click();

    await expect(page).not.toHaveURL("/signin");
  });

  test("Deve negar acesso direto a /events se não estiver logado (Segurança)", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/events");

    await expect(page).toHaveURL(/\/signin/);

    await context.close();
  });

  test("Fluxo Principal: Listar, Filtrar e Inscrever-se em um Evento", async ({
    page,
  }) => {
    await page.goto("/events");

    await expect(
      page.getByRole("heading", { name: /eventos acadêmicos e culturais/i }),
    ).toBeVisible();

    const detailsLink = page
      .getByRole("link", { name: /ver detalhes/i })
      .first();

    await expect(detailsLink).toBeVisible();

    await detailsLink.click();

    await expect(page).toHaveURL(/\/events\/.+/);

    await expect(page.getByText(/detalhes do evento/i)).toBeVisible();
    await expect(page.getByText(/localização|data/i).first()).toBeVisible();

    const subscribeButton = page.getByRole("button", {
      name: /inscrever-se|garantir vaga/i,
    });

    if (await subscribeButton.isVisible()) {
      await subscribeButton.click();

      await expect(
        page
          .getByText(/inscrito com sucesso|você está inscrito/i)
          .or(page.getByText(/inscrever-se no evento/i)),
      ).toBeVisible();
    } else {
      await expect(page.getByText(/cancelar inscrição/i)).toBeVisible();
    }
  });
});
