/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
    readonly VITE_ASSISTANT_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
