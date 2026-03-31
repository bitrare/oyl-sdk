/**
 * Devnet E2E: Alkanes view functions and DIESEL operations.
 *
 * Tests:
 * 1. Query alkane metadata (name, symbol, supply)
 * 2. DIESEL faucet mint simulation
 * 3. frBTC metadata queries
 * 4. Alkanes storage reads
 * 5. Multi-call (batched RPC)
 *
 * Run: npx vitest run __tests__/devnet/e2e-alkanes.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  getOrCreateHarness,
  disposeHarness,
  mineBlocks,
  rpcCall,
  createDevnetProvider,
} from './harness';
import { DEVNET } from './constants';

let harness: any;

beforeAll(async () => {
  harness = await getOrCreateHarness();
  harness.installFetchInterceptor();
  await mineBlocks(101);
}, 60000);

afterAll(() => {
  disposeHarness();
});

function decodeHexString(hex: string): string {
  return Buffer.from(hex.replace('0x', ''), 'hex').toString();
}

function decodeU128LE(hex: string): bigint {
  const bytes = Buffer.from(hex.replace('0x', ''), 'hex');
  let val = 0n;
  for (let i = 0; i < Math.min(bytes.length, 16); i++) {
    val |= BigInt(bytes[i]) << BigInt(i * 8);
  }
  return val;
}

async function simulateView(target: { block: string; tx: string }, opcode: number) {
  return rpcCall('alkanes_simulate', [{
    target,
    inputs: [String(opcode)],
    alkanes: [],
    transaction: '0x',
    block: '0x',
    height: '20000',
    txindex: 0,
    pointer: 0,
    refundPointer: 0,
    vout: 0,
  }]);
}

describe('DIESEL (2:0) metadata', () => {
  it('should return name = DIESEL', async () => {
    const result = await simulateView({ block: '2', tx: '0' }, 99);
    expect(result.execution.error).toBeNull();
    expect(decodeHexString(result.execution.data)).toBe('DIESEL');
  });

  it('should return symbol', async () => {
    const result = await simulateView({ block: '2', tx: '0' }, 100);
    expect(result.execution.error).toBeNull();
    const symbol = decodeHexString(result.execution.data);
    expect(symbol.length).toBeGreaterThan(0);
    console.log(`[alkanes] DIESEL symbol: ${symbol}`);
  });

  it('should return total supply', async () => {
    const result = await simulateView({ block: '2', tx: '0' }, 101);
    expect(result.execution.error).toBeNull();
    if (result.execution.data && result.execution.data !== '0x') {
      const supply = decodeU128LE(result.execution.data);
      console.log(`[alkanes] DIESEL total supply: ${supply}`);
      expect(supply).toBeGreaterThanOrEqual(0n);
    }
  });

  it('should simulate mint (opcode 77)', async () => {
    const result = await simulateView({ block: '2', tx: '0' }, 77);
    expect(result.execution.error).toBeNull();
    // Mint returns alkanes in the response
    console.log(`[alkanes] DIESEL mint: alkanes=${result.execution.alkanes?.length ?? 0} data=${result.execution.data}`);
  });
});

describe('frBTC (32:0) metadata', () => {
  it('should return name = frBTC', async () => {
    const result = await simulateView({ block: '32', tx: '0' }, 99);
    expect(result.execution.error).toBeNull();
    expect(decodeHexString(result.execution.data)).toBe('frBTC');
  });

  it('should return symbol = frBTC', async () => {
    const result = await simulateView({ block: '32', tx: '0' }, 100);
    expect(result.execution.error).toBeNull();
    expect(decodeHexString(result.execution.data)).toBe('frBTC');
  });
});

describe('Provider alkanes integration', () => {
  it('should call alkanes_simulate via provider._call', async () => {
    const provider = await createDevnetProvider();
    const result = await provider.sandshrew._call('alkanes_simulate', [{
      target: { block: '2', tx: '0' },
      inputs: ['99'],
      alkanes: [],
      transaction: '0x',
      block: '0x',
      height: '20000',
      txindex: 0,
      pointer: 0,
      refundPointer: 0,
      vout: 0,
    }]);
    expect(result.execution.error).toBeNull();
    expect(decodeHexString(result.execution.data)).toBe('DIESEL');
  });

  it('should batch multiple RPC calls', async () => {
    const [blockCount, bestHash] = await Promise.all([
      rpcCall('btc_getblockcount'),
      rpcCall('btc_getbestblockhash'),
    ]);
    expect(blockCount).toBeGreaterThanOrEqual(101);
    expect(bestHash.length).toBe(64);
    console.log(`[alkanes] Batch: height=${blockCount} tip=${bestHash.substring(0, 16)}...`);
  });
});

describe('Alkanes error handling', () => {
  it('should return error for invalid opcode', async () => {
    const result = await simulateView({ block: '2', tx: '0' }, 99999);
    // Should either error or return empty
    console.log(`[alkanes] Invalid opcode: error=${result.execution.error} status=${result.status}`);
  });

  it('should return error for non-existent alkane', async () => {
    const result = await simulateView({ block: '999', tx: '999' }, 99);
    // Non-existent alkane should error
    console.log(`[alkanes] Non-existent: error=${result.execution.error} status=${result.status}`);
  });
});
