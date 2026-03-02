import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load .env in the config process to get fallback values
// Only inject vars that aren't already set in the environment
// This allows Docker/CI to override DATABASE_URL without .env overriding it
const { parsed: envParsed = {} } = dotenvConfig({ path: resolve(__dirname, '.env') }) || {};

// Build env injection: only include vars NOT already in process.env
// so that e.g. Docker's DATABASE_URL=postgres://postgres:5432/... takes precedence
const envToInject: Record<string, string> = {};
for (const [key, value] of Object.entries(envParsed)) {
  if (!process.env[key]) {
    envToInject[key] = value as string;
  }
}

export default defineConfig({
  test: {
    globals: true,
    root: './',
    setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
    // Inject env vars into each test worker process (only if not already set)
    env: envToInject,
  },
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
