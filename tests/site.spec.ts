import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { path: '/', title: /Diego Hormazábal/ },
  { path: '/video/', title: /Edición de video/ },
  { path: '/qa/', title: /QA Engineer/ },
];

for (const { path, title } of PAGES) {
  test.describe(`página ${path}`, () => {
    test('carga con título, h1 y sin errores de consola propios', async ({ page, baseURL }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        // Solo errores del propio sitio; las fuentes externas no deben romper el build
        if (msg.type() === 'error' && msg.location().url.startsWith(baseURL!)) errors.push(msg.text());
      });

      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(errors).toEqual([]);
    });

    test('todos los enlaces internos responden 200', async ({ page, request }) => {
      await page.goto(path);
      const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) =>
        [...new Set(links.map((a) => (a as HTMLAnchorElement).getAttribute('href')!.split('#')[0]))],
      );
      for (const href of hrefs) {
        const res = await request.get(href);
        expect(res.status(), `enlace roto: ${href}`).toBe(200);
      }
    });

    test('las anclas internas apuntan a una sección que existe', async ({ page }) => {
      await page.goto(path);
      const anchors = await page.locator('a[href^="#"]').evaluateAll((links) =>
        links.map((a) => a.getAttribute('href')!.slice(1)),
      );
      for (const id of anchors) {
        await expect(page.locator(`[id="${id}"]`), `ancla sin destino: #${id}`).toHaveCount(1);
      }
    });

    test('sin violaciones de accesibilidad serias', async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });

    test('sin scroll horizontal', async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test('la portada lleva a los dos portfolios', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Edición de video/ }).first().click();
  await expect(page).toHaveURL(/\/video\/$/);
  await page.goto('/');
  await page.locator('a.door.qa').click();
  await expect(page).toHaveURL(/\/qa\/$/);
});

for (const path of ['/video/', '/qa/']) {
  test(`el contacto de ${path} tiene un email real`, async ({ page }) => {
    await page.goto(path);
    const email = page.locator('[data-contact="email"]').first();
    await email.scrollIntoViewIfNeeded();
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('href', /^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });
}
