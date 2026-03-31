/**
 * Devnet E2E: Basic SDK operations against in-process Bitcoin devnet.
 *
 * Tests:
 * 1. Devnet creation and block mining
 * 2. BTC balance via Provider
 * 3. UTXO fetching
 * 4. Alkanes simulate (DIESEL total supply)
 * 5. frBTC wrap flow
 *
 * Run: npx vitest run __tests__/devnet/devnet-basics.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import {
  getOrCreateHarness,
  disposeHarness,
  mineBlocks,
  rpcCall,
  createDevnetProvider,
  deriveTestAddresses,
} from './harness';
import { DEVNET } from './constants';

let harness: any;

beforeAll(async () => {
  harness = await getOrCreateHarness();
  harness.installFetchInterceptor();

  // Mine 101 blocks so coinbase is spendable
  await mineBlocks(101);
}, 60000);

afterAll(() => {
  disposeHarness();
});

describe('Devnet basics', () => {
  it('should have mined blocks', async () => {
    const height = await rpcCall('btc_getblockcount');
    expect(height).toBeGreaterThanOrEqual(101);
    console.log(`[devnet] Chain height: ${height}`);
  });

  it('should return BTC balance for coinbase address', async () => {
    const { segwit } = await deriveTestAddresses();
    const utxos = await rpcCall('esplora_address::utxo', [segwit]);
    expect(Array.isArray(utxos)).toBe(true);
    expect(utxos.length).toBeGreaterThan(0);
    const totalBalance = utxos.reduce((sum: number, u: any) => sum + (u.value || 0), 0);
    expect(totalBalance).toBeGreaterThan(0);
    console.log(`[devnet] ${segwit}: ${utxos.length} UTXOs, ${totalBalance} sats`);
  });

  it('should fetch UTXOs for coinbase address', async () => {
    const { segwit } = await deriveTestAddresses();
    const utxos = await rpcCall('esplora_address::utxo', [segwit]);
    expect(Array.isArray(utxos)).toBe(true);
    expect(utxos.length).toBeGreaterThan(0);
    console.log(`[devnet] ${segwit} has ${utxos.length} UTXOs`);
  });

  it('should simulate DIESEL total supply', async () => {
    const result = await rpcCall('alkanes_simulate', [{
      target: { block: '2', tx: '0' },
      inputs: ['101'], // GetTotalSupply opcode
      alkanes: [],
      transaction: '0x',
      block: '0x',
      height: '20000',
      txindex: 0,
      pointer: 0,
      refundPointer: 0,
      vout: 0,
    }]);

    expect(result).toBeDefined();
    expect(result.execution).toBeDefined();
    console.log(`[devnet] DIESEL simulate result:`, result.execution);
  });
});

describe('Provider integration', () => {
  it('should create a Provider pointing at devnet', async () => {
    const provider = await createDevnetProvider();
    expect(provider).toBeDefined();

    // The provider should be able to query the chain
    const blockCount = await provider.sandshrew.bitcoindRpc.getBlockCount!();
    expect(blockCount).toBeGreaterThanOrEqual(101);
    console.log(`[devnet] Provider sees block count: ${blockCount}`);
  });
});
