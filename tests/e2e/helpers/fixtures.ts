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

export const installCameraRegressionInstrumentation = async (page: Page) => {
  await page.addInitScript(() => {
    const scope = window as any;
    if (scope.__ARPF_E2E_CAMERA_REGRESSION_INSTRUMENTED__) {
      return;
    }
    scope.__ARPF_E2E_CAMERA_REGRESSION_INSTRUMENTED__ = true;
    scope.__ARPF_E2E_GUM_CALLS__ = [];
    scope.__ARPF_E2E_CAPTURE_DRAWS__ = [];

    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    if (originalGetUserMedia) {
      navigator.mediaDevices.getUserMedia = async (constraints: MediaStreamConstraints) => {
        scope.__ARPF_E2E_GUM_CALLS__.push(JSON.parse(JSON.stringify(constraints)));
        return originalGetUserMedia(constraints);
      };
    }

    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (...args: unknown[]) {
      if (args.length >= 9) {
        const [source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = args;
        const targetWidth = Number(dWidth);
        const targetHeight = Number(dHeight);
        const targetX = Number(dx);
        const targetY = Number(dy);
        const currentCanvas = this.canvas;

        if (
          currentCanvas instanceof HTMLCanvasElement &&
          Number.isFinite(targetWidth) &&
          Number.isFinite(targetHeight) &&
          Math.abs(targetX) < 0.001 &&
          Math.abs(targetY) < 0.001 &&
          Math.abs(currentCanvas.width - targetWidth) < 0.001 &&
          Math.abs(currentCanvas.height - targetHeight) < 0.001 &&
          targetWidth >= 1000 &&
          targetHeight >= 700
        ) {
          const sourceWidth =
            source && typeof source === "object" && "videoWidth" in source
              ? Number((source as HTMLVideoElement).videoWidth)
              : source && typeof source === "object" && "width" in source
                ? Number((source as HTMLCanvasElement).width)
                : 0;
          const sourceHeight =
            source && typeof source === "object" && "videoHeight" in source
              ? Number((source as HTMLVideoElement).videoHeight)
              : source && typeof source === "object" && "height" in source
                ? Number((source as HTMLCanvasElement).height)
                : 0;

          scope.__ARPF_E2E_CAPTURE_DRAWS__.push({
            sx: Number(sx),
            sy: Number(sy),
            sWidth: Number(sWidth),
            sHeight: Number(sHeight),
            targetWidth,
            targetHeight,
            sourceWidth,
            sourceHeight,
          });
        }
      }
      return originalDrawImage.apply(this, args as Parameters<CanvasRenderingContext2D["drawImage"]>);
    };
  });
};

export const clearCaptureDrawCalls = async (page: Page) => {
  await page.evaluate(() => {
    (window as any).__ARPF_E2E_CAPTURE_DRAWS__ = [];
  });
};

export const expectLatestCameraConstraintsToUseIdealValues = async (
  page: Page,
  expected: { aspectRatio: number; facingMode?: "environment" | "user" }
) => {
  const latestConstraint = await page.evaluate(() => {
    const calls = (window as any).__ARPF_E2E_GUM_CALLS__ || [];
    const latest = calls.at(-1) as MediaStreamConstraints | undefined;
    if (!latest || !latest.video || typeof latest.video !== "object") {
      return null;
    }
    const video = latest.video as MediaTrackConstraints;
    return {
      widthIdeal: typeof video.width === "object" ? (video.width as ConstrainULongRange).ideal : null,
      widthExact: typeof video.width === "object" ? (video.width as ConstrainULongRange).exact : null,
      heightIdeal:
        typeof video.height === "object" ? (video.height as ConstrainULongRange).ideal : null,
      heightExact:
        typeof video.height === "object" ? (video.height as ConstrainULongRange).exact : null,
      aspectRatioIdeal:
        typeof video.aspectRatio === "object"
          ? (video.aspectRatio as ConstrainDoubleRange).ideal
          : null,
      aspectRatioExact:
        typeof video.aspectRatio === "object"
          ? (video.aspectRatio as ConstrainDoubleRange).exact
          : null,
      facingModeIdeal:
        typeof video.facingMode === "object"
          ? (video.facingMode as ConstrainDOMStringParameters).ideal
          : null,
      facingModeExact:
        typeof video.facingMode === "object"
          ? (video.facingMode as ConstrainDOMStringParameters).exact
          : null,
    };
  });

  expect(latestConstraint).not.toBeNull();
  expect(latestConstraint?.widthIdeal).toBeGreaterThan(0);
  expect(latestConstraint?.heightIdeal).toBeGreaterThan(0);
  expect(latestConstraint?.widthExact).toBeUndefined();
  expect(latestConstraint?.heightExact).toBeUndefined();
  expect(latestConstraint?.aspectRatioIdeal).toBeCloseTo(expected.aspectRatio, 3);
  expect(latestConstraint?.aspectRatioExact).toBeUndefined();
  if (expected.facingMode) {
    expect(latestConstraint?.facingModeIdeal).toBe(expected.facingMode);
  }
  expect(latestConstraint?.facingModeExact).toBeUndefined();
};

export const expectLatestCaptureToUseCenteredCoverCrop = async (
  page: Page,
  expectedSize: { width: number; height: number }
) => {
  const cropCheck = await page.evaluate(({ width, height }) => {
    const drawCalls = (window as any).__ARPF_E2E_CAPTURE_DRAWS__ || [];
    const latest = drawCalls.at(-1);
    if (!latest) {
      return null;
    }
    const targetAspectRatio = width / height;
    const sourceAspectRatio = latest.sourceWidth / latest.sourceHeight;
    let expectedSx = 0;
    let expectedSy = 0;
    let expectedSWidth = latest.sourceWidth;
    let expectedSHeight = latest.sourceHeight;

    if (sourceAspectRatio > targetAspectRatio) {
      expectedSWidth = latest.sourceHeight * targetAspectRatio;
      expectedSx = (latest.sourceWidth - expectedSWidth) / 2;
    } else if (sourceAspectRatio < targetAspectRatio) {
      expectedSHeight = latest.sourceWidth / targetAspectRatio;
      expectedSy = (latest.sourceHeight - expectedSHeight) / 2;
    }

    return {
      latest,
      expected: {
        sx: expectedSx,
        sy: expectedSy,
        sWidth: expectedSWidth,
        sHeight: expectedSHeight,
      },
      targetAspectRatio,
    };
  }, expectedSize);

  expect(cropCheck).not.toBeNull();
  expect(cropCheck?.latest.targetWidth).toBe(expectedSize.width);
  expect(cropCheck?.latest.targetHeight).toBe(expectedSize.height);
  expect(cropCheck?.latest.sourceWidth).toBeGreaterThan(0);
  expect(cropCheck?.latest.sourceHeight).toBeGreaterThan(0);
  expect(Math.abs((cropCheck?.latest.sWidth ?? 0) - (cropCheck?.expected.sWidth ?? 0))).toBeLessThan(1);
  expect(Math.abs((cropCheck?.latest.sHeight ?? 0) - (cropCheck?.expected.sHeight ?? 0))).toBeLessThan(1);
  expect(Math.abs((cropCheck?.latest.sx ?? 0) - (cropCheck?.expected.sx ?? 0))).toBeLessThan(1);
  expect(Math.abs((cropCheck?.latest.sy ?? 0) - (cropCheck?.expected.sy ?? 0))).toBeLessThan(1);
  expect(
    Math.abs(
      (cropCheck?.latest.sWidth ?? 1) / (cropCheck?.latest.sHeight ?? 1) -
        (cropCheck?.targetAspectRatio ?? 0)
    )
  ).toBeLessThan(0.01);
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
