/**
 * Shared helpers for devnet e2e tests.
 *
 * Provides wallet signing, UTXO gathering, and transaction broadcast
 * wrappers that work with the oyl-sdk against the in-process devnet.
 */
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from '@bitcoinerlab/secp256k1';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import { DEVNET } from './constants';
import { rpcCall, mineBlocks } from './harness';
import type { Provider } from '../../src/provider/provider';

try { bitcoin.initEccLib(ecc); } catch {}
const bip32 = BIP32Factory(ecc);

/**
 * Get all UTXOs for an address and format them for oyl-sdk.
 */
export async function getFormattedUtxos(address: string) {
  const rawUtxos = await rpcCall('esplora_address::utxo', [address]);
  return rawUtxos.map((u: any) => ({
    txid: u.txid,
    vout: u.vout,
    value: u.value,
    satoshis: u.value,
    status: u.status,
    script: '', // Will be filled by the SDK
  }));
}

/**
 * Get total BTC balance for an address in sats.
 */
export async function getBtcBalance(address: string): Promise<number> {
  const utxos = await rpcCall('esplora_address::utxo', [address]);
  return utxos.reduce((sum: number, u: any) => sum + (u.value || 0), 0);
}

/**
 * Get alkane balance for an address via alkanes_simulate.
 */
export async function getAlkaneBalance(
  address: string,
  alkaneId: { block: string; tx: string },
): Promise<bigint> {
  try {
    const result = await rpcCall('alkanes_protorunesbyaddress', [{
      address,
      protocolTag: '1',
    }]);
    if (!result?.outpoints) return 0n;
    for (const outpoint of result.outpoints) {
      for (const balance of outpoint.balances || []) {
        if (balance.id?.block === alkaneId.block && balance.id?.tx === alkaneId.tx) {
          return BigInt(balance.value || '0');
        }
      }
    }
    return 0n;
  } catch {
    return 0n;
  }
}

/**
 * Create a test signer from the test mnemonic.
 * Returns keypairs and addresses for BIP84 (segwit) and BIP86 (taproot).
 */
export function createTestWallet() {
  const seed = bip39.mnemonicToSeedSync(DEVNET.TEST_MNEMONIC);
  const root = bip32.fromSeed(seed);
  const net = bitcoin.networks.regtest;

  // BIP84 native segwit
  const segKey = root.derivePath("m/84'/0'/0'/0/0");
  const segPayment = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(segKey.publicKey),
    network: net,
  });

  // BIP86 taproot
  const tapKey = root.derivePath("m/86'/0'/0'/0/0");
  const tapPayment = bitcoin.payments.p2tr({
    internalPubkey: Buffer.from(tapKey.publicKey).slice(1),
    network: net,
  });

  return {
    segwit: {
      address: segPayment.address!,
      publicKey: Buffer.from(segKey.publicKey).toString('hex'),
      privateKey: segKey.privateKey!,
      payment: segPayment,
    },
    taproot: {
      address: tapPayment.address!,
      publicKey: Buffer.from(tapKey.publicKey).toString('hex'),
      internalPubkey: Buffer.from(tapKey.publicKey).slice(1).toString('hex'),
      privateKey: tapKey.privateKey!,
      payment: tapPayment,
    },
    network: net,
  };
}

/**
 * Fund an address by mining blocks (coinbase goes to the test wallet).
 * Mine extra blocks to make coinbase spendable.
 */
export async function fundAddress(blockCount: number = 1) {
  await mineBlocks(blockCount);
}

/**
 * Send BTC from the test wallet to a target address.
 * Uses raw transaction construction (no SDK dependency).
 */
export async function sendBtc(
  toAddress: string,
  amountSats: number,
): Promise<string> {
  const wallet = createTestWallet();
  const utxos = await rpcCall('esplora_address::utxo', [wallet.segwit.address]);

  if (utxos.length === 0) throw new Error('No UTXOs available');

  // Find a UTXO large enough
  const utxo = utxos.find((u: any) => u.value >= amountSats + 1000);
  if (!utxo) throw new Error(`No UTXO large enough for ${amountSats} sats`);

  const psbt = new bitcoin.Psbt({ network: wallet.network });

  // Get the raw tx for the input
  const rawHex = await rpcCall('btc_getrawtransaction', [utxo.txid]);
  const rawTx = Buffer.from(rawHex, 'hex');

  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    nonWitnessUtxo: rawTx,
  });

  // Output to target
  psbt.addOutput({
    address: toAddress,
    value: amountSats,
  });

  // Change back to self
  const change = utxo.value - amountSats - 1000; // 1000 sat fee
  if (change > 546) {
    psbt.addOutput({
      address: wallet.segwit.address,
      value: change,
    });
  }

  psbt.signInput(0, {
    publicKey: Buffer.from(wallet.segwit.payment.pubkey!),
    sign: (hash: Buffer) => Buffer.from(ecc.sign(hash, wallet.segwit.privateKey)),
  });

  psbt.finalizeAllInputs();
  const txHex = psbt.extractTransaction().toHex();

  // Broadcast (devnet mines immediately)
  const txid = await rpcCall('btc_sendrawtransaction', [txHex]);
  return txid;
}
