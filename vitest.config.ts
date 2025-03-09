import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  plugins: [
    analyzer({
      analyzerMode: "static",
      openAnalyzer: true,
    }),
  ],
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
