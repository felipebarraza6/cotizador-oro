/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  /** @deprecated usar VITE_API_BASE */
  readonly VITE_YGGDRA_API_BASE?: string;
  readonly VITE_BRANCH_SLUG: string;
  readonly VITE_BRAND_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
