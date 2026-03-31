import { expectDownloadBySaveButton, test, captureAndOpenSavePage } from "../helpers/fixtures";

test("gifフレームで撮影から保存まで完了できる", async ({ page }) => {
  await captureAndOpenSavePage(page, "/vtuber", "/saveGIF", {
    width: 1280,
    height: 960,
  });
  await expectDownloadBySaveButton(page, ".gif");
});
