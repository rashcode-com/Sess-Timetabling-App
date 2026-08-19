import type { KVNamespace, Fetcher } from '@cloudflare/workers-types';

export type Bindings = {
  DATA_KV?: KVNamespace;
  ASSETS?: Fetcher;
  SYNC_TOKEN?: string;
  ENVIRONMENT?: string;
};

export type Variables = {
  // Add any custom request-scoped variables here
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
