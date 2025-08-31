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
          // Common languages from your original list
          "es",
          "zh-Hans-CN",
          "zh-Hant-TW",
          "vi",
          "de",
          "ja",
          "ko",
          "ru",
          "ar",
          "pt",
          "it",
          "nl",
          "sv",
          "pl",
          "tr",
          "th",
          "id",
          "ms",
          "fil",
          "hi",
          "bn",
          "ur",
          "fa",
          "ro",
          "el",
          "cs",
          "hu",
          "da",
          "fi",
          "uk",
          "bg",
          "sr",
          "hr",
          "sk",
          "lt",
          "lv",
          "et",
          "sl",
          "is",
          "ga",
          "cy",
          // "he", --- enable this!
          // "sw", --- enable this!
          // "am",
          // "yo",
          // "ha",
          // "om",
          // "zu",
          "af",

          // Additional languages from your dropdown options
          "en",
          "fr",
          "pa",
          // "my",
          "km",
          // "lo",
          // "ne",
          // "si",
          "ka",
          // "hy",
          "az",
          "kk",
          "uz",
          // "mn",
          // "bs",
          // "mk",
          "sq",
          // "ee",
          // "tw",
          // "ig",
          "rw",
          // "mg",
          // "mi",
          // "sm",
          // "to",
          // "fj",
          // "ht",
          // "lb",
          // "br",
          // "kw",
          // "gd",
          // "gv",
          // "ak",
          // "ff",
          // "ln",
          // "lg",
          // "sn",
          // "st",
          // "tn",
          // "wo",
          // "tzm",
          "ti",
          // "as",
          // "or",
          // "ks",
          // "sd",
          // "doi",
          // "mai",
          // "sat",
          // "kok",
          // "jv",
          // "su",
          // "ceb",
          // "mnw",
          // "sg",
          // "ug",
          // "bo",
          // "ky",
          // "tg",
          // "tk",
          // "fo",
          // "se",
          // "wa",
          // "fy",
          // "ay",
          // "gn",
          // "nah",
          // "qu",
          // "iu",
          // "pap",
          // "haw",
          // "ty",
          // "mh",
          "ta",
          "te",
          // "mr",
          // "gu",
          // "kn",
          // "ml",
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
        include: ["crypto", "stream", "buffer", "util", "path"],
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
        },
      },

      sourcemap: true,
    },
    server: {
      port: 7777,
    },
  })
);
