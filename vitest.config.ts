import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["fake-indexeddb/auto", "./vitest.setup.ts"],
    deps: {
      inline: ["vitest-canvas-mock"],
    },
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
  },
});
