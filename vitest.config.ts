import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

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
