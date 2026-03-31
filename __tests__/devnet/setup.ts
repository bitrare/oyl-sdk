/**
 * Test setup: patch node-fetch to use globalThis.fetch.
 *
 * The devnet's fetch interceptor patches globalThis.fetch, but oyl-sdk's
 * sandshrew client imports node-fetch directly. This setup ensures all
 * fetch calls go through the interceptor.
 */
import { vi } from 'vitest';

vi.mock('node-fetch', () => {
  return {
    __esModule: true,
    default: (...args: any[]) => globalThis.fetch(...args),
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response,
  };
});
