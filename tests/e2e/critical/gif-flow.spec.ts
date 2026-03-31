import { expectDownloadBySaveButton, test, captureAndOpenSavePage } from "../helpers/fixtures";

test("gifフレームで撮影から保存まで完了できる", async ({ page }) => {
  await captureAndOpenSavePage(page, "/vtuber", "/saveGIF");
  await expectDownloadBySaveButton(page, ".gif");
});
