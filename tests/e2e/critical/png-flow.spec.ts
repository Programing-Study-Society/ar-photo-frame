import {
  captureAndOpenSavePage,
  clearCaptureDrawCalls,
  expectDownloadBySaveButton,
  expectLatestCaptureToUseCenteredCoverCrop,
  installCameraRegressionInstrumentation,
  test,
} from "../helpers/fixtures";

test("pngフレームで撮影から保存まで完了できる", async ({ page }) => {
  await installCameraRegressionInstrumentation(page);
  await clearCaptureDrawCalls(page);
  await captureAndOpenSavePage(page, "/faculty_of_architectural_design", "/savePNG", {
    width: 1280,
    height: 960,
  });
  await expectLatestCaptureToUseCenteredCoverCrop(page, {
    width: 1280,
    height: 960,
  });
  await expectDownloadBySaveButton(page, ".png");
});
