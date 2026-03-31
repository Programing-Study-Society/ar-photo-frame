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

export const expectCameraStyleApplied = async (page: Page) => {
  const styleInfo = await page.evaluate(() => {
    const camera = document.querySelector<HTMLElement>("[data-testid='camera-view']");
    const cameraContainer = camera?.parentElement as HTMLElement | null;
    if (!camera || !cameraContainer) {
      return null;
    }
    const cameraStyle = window.getComputedStyle(camera);
    const containerStyle = window.getComputedStyle(cameraContainer);
    return {
      objectFit: cameraStyle.objectFit,
      objectPosition: cameraStyle.objectPosition,
      maxHeight: cameraStyle.maxHeight,
      containerHeight: cameraContainer.getBoundingClientRect().height,
      containerPosition: containerStyle.position,
    };
  });

  expect(styleInfo).not.toBeNull();
  expect(styleInfo?.objectFit).toBe("cover");
  expect(
    styleInfo?.objectPosition.includes("50%") || styleInfo?.objectPosition.includes("center")
  ).toBeTruthy();
  expect(styleInfo?.maxHeight).not.toBe("none");
  expect(styleInfo?.containerHeight).toBeGreaterThan(0);
  expect(styleInfo?.containerPosition).toBe("relative");
};

export const captureAndOpenSavePage = async (
  page: Page,
  route: `/${string}`,
  saveRoute: "/savePNG" | "/saveGIF",
  expectedSize?: { width: number; height: number }
) => {
  await page.goto(route);
  await waitForFrameReady(page);
  await page.getByTestId("capture-button").click();
  await expect(page).toHaveURL(new RegExp(`${saveRoute}$`));
  await expect(page.getByTestId("save-preview-canvas")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("save-page-error-message")).toBeHidden({ timeout: 30_000 });

  if (expectedSize) {
    await expect(page.getByTestId("save-preview-canvas")).toHaveJSProperty(
      "width",
      expectedSize.width
    );
    await expect(page.getByTestId("save-preview-canvas")).toHaveJSProperty(
      "height",
      expectedSize.height
    );
  }
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
