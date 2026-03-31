import { expectDownloadBySaveButton, test, captureAndOpenSavePage } from "../helpers/fixtures";

test("faceフレームで撮影から保存まで完了できる", async ({ page }) => {
  await captureAndOpenSavePage(page, "/oecu", "/savePNG", {
    width: 1280,
    height: 960,
  });
  await expectDownloadBySaveButton(page, ".png");
});
