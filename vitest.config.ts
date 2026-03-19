import { fileURLToPath } from 'node:url';

import { loadEnv } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    watch: false,
    // mode defines what ".env.{mode}" file to choose if exists
    env: loadEnv(mode, process.cwd(), ''), // loads env variables from .env files
    exclude: [...configDefaults.exclude],
    alias: {
      '~/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
}));
