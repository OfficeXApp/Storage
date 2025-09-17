import { sentryVitePlugin } from "@sentry/vite-plugin";
// vite.config.ts

import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import lingoCompiler from "lingo.dev/compiler";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const isProduction = true;

// https://vitejs.dev/config/
export default defineConfig(() =>
  lingoCompiler.vite({
    sourceRoot: "src",
    debug: true,
    targetLocales: isProduction
      ? [
          "zh-Hans-CN",
          // "zh-Hant-TW",
          // "vi",
          // "de",
          // "ja",
          // "ko",
          // "ru",
          // "ar",
          // "es",
          // "pt",

          // "it",
          // "nl",
          // "sv",
          // "pl",
          // "tr",
          // "th",
          // "id",
          // "ms",
          // "fil",
          // "hi",
          // "bn",

          // "ur",
          // "fa",
          // "ro",
          // "el",
          // "cs",
          // "hu",
          // "da",
          // "fi",
          // "uk",
          // "bg",
          // "sr",
          // "hr",
          // "sk",

          // "af",
          // "en",
          // "fr",
          // "pa",
          // "az",
          // "kk",
          // "uz",
          // "rw",
          // "ti",
          // "ta",
          // "te",
        ]
      : ["zh-Hans-CN"],
    models: {
      "*:*": "google:gemini-2.5-flash",
    },
  })({
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
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
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
      nodePolyfills({
        // include: ["crypto", "stream", "buffer", "util", "path"],

        include: ["crypto", "stream", "buffer"],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        exclude: ["fs"],
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
          // Manual chunking for better performance
          manualChunks: {
            // Core React libraries
            vendor: ["react", "react-dom", "react-router-dom"],

            // Ant Design UI library
            antd: ["antd", "@ant-design/icons"],

            // Crypto and blockchain libraries
            crypto: [
              "@dfinity/identity",
              "@dfinity/principal",
              "@scure/bip39",
              "bip39",
              "ed25519-hd-key",
              "viem",
            ],

            // Large utility libraries
            utils: ["lodash", "dayjs", "uuid", "fuse.js"],

            // File handling libraries
            files: ["xlsx", "highlight.js"],

            // AWS and cloud storage
            aws: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],

            // Redux and state management
            redux: ["react-redux", "@redux-offline/redux-offline", "rxjs"],
          },
        },
      },

      sourcemap: true,
    },
    server: {
      port: 7777,
    },
  })
);
