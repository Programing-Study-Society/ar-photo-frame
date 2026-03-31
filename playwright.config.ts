import { defineConfig, devices } from "@playwright/test";

const fakeMediaArgs = ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"];
const firefoxCameraPrefs = {
  "media.navigator.streams.fake": true,
  "media.navigator.permission.disabled": true,
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev:test",
    url: "http://127.0.0.1:4173/faculty_of_architectural_design",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        permissions: ["camera"],
        launchOptions: {
          args: fakeMediaArgs,
        },
      },
    },
    {
      name: "desktop-firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: firefoxCameraPrefs,
        },
      },
    },
    {
      name: "iphone-chrome",
      use: {
        ...devices["iPhone 14"],
        browserName: "chromium",
        channel: "chrome",
        permissions: ["camera"],
        launchOptions: {
          args: fakeMediaArgs,
        },
      },
    },
    {
      name: "iphone-firefox",
      use: {
        ...devices["iPhone 14"],
        browserName: "firefox",
        isMobile: false,
        hasTouch: true,
        viewport: { width: 390, height: 844 },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X; rv:135.0) Gecko/135.0 Firefox/135.0",
        launchOptions: {
          firefoxUserPrefs: firefoxCameraPrefs,
        },
      },
    },
    {
      name: "android-chrome",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        channel: "chrome",
        permissions: ["camera"],
        launchOptions: {
          args: fakeMediaArgs,
        },
      },
    },
    {
      name: "android-firefox",
      use: {
        ...devices["Pixel 7"],
        browserName: "firefox",
        isMobile: false,
        hasTouch: true,
        viewport: { width: 412, height: 915 },
        userAgent:
          "Mozilla/5.0 (Android 14; Mobile; rv:135.0) Gecko/135.0 Firefox/135.0",
        launchOptions: {
          firefoxUserPrefs: firefoxCameraPrefs,
        },
      },
    },
    {
      name: "tablet-chrome",
      use: {
        ...devices["iPad Pro 11"],
        browserName: "chromium",
        channel: "chrome",
        permissions: ["camera"],
        launchOptions: {
          args: fakeMediaArgs,
        },
      },
    },
    {
      name: "tablet-firefox",
      use: {
        ...devices["iPad Pro 11"],
        browserName: "firefox",
        isMobile: false,
        hasTouch: true,
        viewport: { width: 834, height: 1194 },
        userAgent:
          "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/135.0 Mobile/15E148 Safari/605.1.15",
        launchOptions: {
          firefoxUserPrefs: firefoxCameraPrefs,
        },
      },
    },
  ],
});
