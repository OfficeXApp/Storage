// vite.config.ts

import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "window",
  },
  plugins: [
    react(),
    VitePWA({
      mode: "development",
      strategies: "injectManifest",
      srcDir: "src",
      // @ts-ignore
      filename: "sw.ts",
      injectManifest: {
        injectionPoint: "self.__WB_MANIFEST",
        // Add additional configuration to ensure proper compilation
        rollupFormat: "es",
      },
      // WebManifest options
      manifest: {
        name: "OfficeX Drive Storage",
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
        enabled: true,
        type: "module",
      },
    }),
  ],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
      },
    },
    // Ensure correct entry points and output
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "[name].[hash].js",
        chunkFileNames: "[name].[hash].js",
        assetFileNames: "[name].[hash].[ext]",
      },
    },
  },
});
