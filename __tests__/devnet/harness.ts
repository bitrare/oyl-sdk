/**
 * Devnet harness for oyl-sdk integration tests.
 *
 * Creates an in-process Bitcoin devnet with alkanes indexer via
 * @qubitcoin/sdk's DevnetTestHarness. Patches globalThis.fetch so
 * the oyl-sdk Provider talks to the devnet without network calls.
 */
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { DEVNET, loadFixtureWasm } from './constants';

try { bitcoin.initEccLib(ecc); } catch {}
const bip32 = BIP32Factory(ecc);

let _harness: any = null;

/**
 * Derive the coinbase private key from the test mnemonic.
 * BIP84 m/84'/1'/0'/0/0 so coinbase UTXOs are spendable by the SDK wallet.
 */
function deriveSecretKey(mnemonic: string): Uint8Array {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const child = root.derivePath("m/84'/1'/0'/0/0");
  if (!child.privateKey) throw new Error('Failed to derive private key');
  return new Uint8Array(child.privateKey);
}

/**
 * Create or return the shared DevnetTestHarness singleton.
 */
export async function getOrCreateHarness(): Promise<any> {
  if (_harness) return _harness;

  const alkanesWasm = loadFixtureWasm('alkanes');
  if (!alkanesWasm) {
    throw new Error('alkanes.wasm not found in __tests__/devnet/fixtures/');
  }

  const esploraWasm = loadFixtureWasm('esplora');
  const secretKey = deriveSecretKey(DEVNET.TEST_MNEMONIC);

  const sdk = await import('@qubitcoin/sdk');
  _harness = await sdk.DevnetTestHarness.create({
    alkanesWasm,
    esploraWasm: esploraWasm ?? undefined,
    secretKey,
  });

  return _harness;
}

/**
 * Dispose the shared harness (call in afterAll).
 */
export function disposeHarness(): void {
  if (_harness) {
    _harness.dispose();
    _harness = null;
  }
}

/**
 * Mine blocks on the devnet.
 */
export async function mineBlocks(count: number): Promise<void> {
  if (!_harness) throw new Error('No harness');
  _harness.mineBlocks(count);
}

/**
 * Make a JSON-RPC call through the intercepted fetch.
 */
export async function rpcCall(method: string, params: any[] = []): Promise<any> {
  const response = await fetch(DEVNET.RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  const json = await response.json();
  if (json.error) throw new Error(`RPC error: ${json.error.message}`);
  return json.result;
}

/**
 * Create an oyl-sdk Provider pointing at the devnet.
 */
export async function createDevnetProvider() {
  const { Provider } = await import('../../src/provider');
  const network = await import('../../src/network');

  return new Provider({
    url: 'http://localhost:18888',
    version: '',
    projectId: '',
    network: network.regtest,
    networkType: 'regtest',
  });
}

/**
 * Derive test wallet addresses from the test mnemonic.
 */
export async function deriveTestAddresses(): Promise<{
  segwit: string;
  taproot: string;
}> {
  const seed = bip39.mnemonicToSeedSync(DEVNET.TEST_MNEMONIC);
  const root = bip32.fromSeed(seed);
  const net = bitcoin.networks.regtest;

  const seg = root.derivePath("m/84'/1'/0'/0/0");
  const tap = root.derivePath("m/86'/1'/0'/0/0");

  return {
    segwit: bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(seg.publicKey),
      network: net,
    }).address!,
    taproot: bitcoin.payments.p2tr({
      internalPubkey: Buffer.from(tap.publicKey).slice(1),
      network: net,
    }).address!,
  };
}
