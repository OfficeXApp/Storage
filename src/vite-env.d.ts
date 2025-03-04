/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

// src/vite-env.d.ts

// PWA environment variables
interface ImportMetaEnv {
  readonly VITE_PWA_DEV_ENABLED: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Virtual modules from the PWA plugin
declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined
    ) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}

// To support compilation in the service worker TypeScript file
declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<{
      url: string;
      revision: string | null;
    }>;
  }
}
