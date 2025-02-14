import { configDefaults, defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "vite.config.ts",
    test: {
      // an example of file based convention,
      // you don't have to follow it
      include: ["**/__tests__/**/*.{test,spec}.{ts,tsx}"],
      exclude: [...configDefaults.exclude, "**/browser/**", "**/*.browser.*"],
      name: "unit",
      // environment: "node",
    },
  },
  {
    extends: "vite.config.ts",
    test: {
      name: "browser",
      include: [
        "**/__tests__/browser/**/*.{test,spec}.{ts,tsx}",
        "**/__tests__/**/*.browser.{test,spec}.{ts,tsx}",
      ],
      browser: {
        enabled: true,
        provider: "playwright",
        instances: [{ browser: "chromium" }],
      },
    },
  },
]);
