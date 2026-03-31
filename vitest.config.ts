import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['__tests__/devnet/**/*.test.ts'],
    testTimeout: 120000,
    hookTimeout: 60000,
    setupFiles: ['__tests__/devnet/setup.ts'],
  },
  resolve: {
    alias: {
      '@qubitcoin/sdk': resolve(__dirname, 'vendor/@qubitcoin/sdk/dist/index.js'),
    },
  },
});
