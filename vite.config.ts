import { sentryVitePlugin } from "@sentry/vite-plugin";
// vite.config.ts

import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

const isProduction = true;

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "window",
  },
  plugins: [
    react(),
    VitePWA({
      mode: isProduction ? "production" : "development", //
      strategies: "injectManifest",
      srcDir: "src",
      // @ts-ignore
      filename: "sw.ts",
      injectManifest: {
        injectionPoint: "self.__WB_MANIFEST",
        // Add additional configuration to ensure proper compilation
        rollupFormat: "es",
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      // WebManifest options
      manifest: {
        name: "Anonymous OfficeX",
        short_name: "OfficeX",
        description: "Cloud Storage & Offline Filesystem",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: isProduction ? false : true,
        type: "module",
      },
    }),
    visualizer({
      open: isProduction ? false : true,
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
    sentryVitePlugin({
      org: "officex",
      project: "officex-official",
    }),
  ],
  build: {
    minify: "terser",

    terserOptions: {
      compress: {
        drop_console: isProduction ? true : false, // Keep console logs for debugging
      },
    },

    cssCodeSplit: true,

    // Ensure correct entry points and output
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "[name].[hash].js",
        chunkFileNames: "[name].[hash].js",
        assetFileNames: "[name].[hash].[ext]",
        format: "es",
      },
    },

    sourcemap: true,
  },
  server: {
    port: 7777,
  },
});
