import {
  expect,
  expectCameraStyleApplied,
  test,
} from "../helpers/fixtures";

const centeringCheckRoutes = [
  { id: "png", route: "/faculty_of_architectural_design" },
  { id: "gif", route: "/vtuber" },
] as const;

for (const target of centeringCheckRoutes) {
  test(`${target.id}フレームでカメラが中央に表示される`, async ({ page }) => {
    await page.goto(target.route);
    await expect(page.getByTestId("frame-error-message")).toHaveCount(0);
    await expect(
      page.getByTestId("capture-button").or(page.getByTestId("loading-camera-indicator"))
    ).toBeVisible();
    await expectCameraStyleApplied(page);
  });
}
