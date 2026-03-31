/**
 * Devnet constants for in-process integration tests.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export const DEVNET = {
  RPC_URL: 'http://localhost:18888',

  // Genesis alkane IDs
  FRBTC_ID: '32:0',
  DIESEL_ID: '2:0',

  // Factory (deployed during test setup)
  FACTORY_ID: '4:65522',

  FACTORY_OPCODES: {
    InitFactory: 0,
    CreateNewPool: 1,
    FindExistingPoolId: 2,
    GetAllPools: 3,
    GetNumPools: 4,
    SwapExactTokensForTokens: 13,
    SwapTokensForExactTokens: 14,
  },

  FRBTC_OPCODES: {
    Wrap: 77,
    Unwrap: 78,
    GetTotalSupply: 101,
  },

  TEST_MNEMONIC:
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
} as const;

/**
 * Load a WASM indexer from the fixtures directory.
 */
export function loadFixtureWasm(name: string): Uint8Array | null {
  const paths = [
    resolve(__dirname, `fixtures/${name}.wasm`),
    resolve(process.env.HOME || '~', `.local/qubitcoin/indexers/${name}/program.wasm`),
  ];

  for (const p of paths) {
    if (existsSync(p)) {
      return new Uint8Array(readFileSync(p));
    }
  }
  return null;
}
