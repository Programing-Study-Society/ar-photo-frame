import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      (window as any).__ARPF_E2E_FACE_MOCK__ = true;
    });
    await use(page);
  },
});

export { expect };

export const waitForFrameReady = async (page: Page) => {
  await expect(page.getByTestId("camera-view")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("capture-button")).toBeVisible({ timeout: 30_000 });
};

export const captureAndOpenSavePage = async (
  page: Page,
  route: `/${string}`,
  saveRoute: "/savePNG" | "/saveGIF"
) => {
  await page.goto(route);
  await waitForFrameReady(page);
  await page.getByTestId("capture-button").click();
  await expect(page).toHaveURL(new RegExp(`${saveRoute}$`));
  await expect(page.getByTestId("save-preview-canvas")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("save-button")).toBeVisible({ timeout: 60_000 });
};

export const expectDownloadBySaveButton = async (
  page: Page,
  extension: ".png" | ".gif"
) => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("save-button").click(),
  ]);

  const suggestedFilename = download.suggestedFilename();
  expect(suggestedFilename).toContain("oecu_");
  expect(suggestedFilename.endsWith(extension)).toBeTruthy();
};
