/**
 * oyl-sdk specific helpers for devnet e2e tests.
 *
 * Creates Account, Signer, and Provider instances from the test mnemonic
 * that work with the oyl-sdk's own functions (execute, deploy, swap, etc.)
 */
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from '@bitcoinerlab/secp256k1';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import { DEVNET } from './constants';
import { mnemonicToAccount } from '../../src/account/account';
import { Signer } from '../../src/signer/signer';
import { Provider } from '../../src/provider/provider';
import * as network from '../../src/network';
import { rpcCall } from './harness';
import type { Account } from '../../src/account/account';
import type { FormattedUtxo } from '../../src/utxo/types';

try { bitcoin.initEccLib(ecc); } catch {}
const bip32 = BIP32Factory(ecc);

/**
 * Create an oyl-sdk Account from the test mnemonic.
 */
export function createTestAccount(): Account {
  return mnemonicToAccount({
    mnemonic: DEVNET.TEST_MNEMONIC,
    opts: {
      network: bitcoin.networks.regtest,
      index: 0,
    },
  });
}

/**
 * Create an oyl-sdk Signer from the test mnemonic.
 */
export function createTestSigner(): Signer {
  const seed = bip39.mnemonicToSeedSync(DEVNET.TEST_MNEMONIC);
  const root = bip32.fromSeed(seed);

  const segKey = root.derivePath("m/84'/0'/0'/0/0");
  const tapKey = root.derivePath("m/86'/0'/0'/0/0");
  const legKey = root.derivePath("m/44'/0'/0'/0/0");
  const nesKey = root.derivePath("m/49'/0'/0'/0/0");

  return new Signer(bitcoin.networks.regtest, {
    segwitPrivateKey: segKey.privateKey!.toString('hex'),
    taprootPrivateKey: tapKey.privateKey!.toString('hex'),
    legacyPrivateKey: legKey.privateKey!.toString('hex'),
    nestedSegwitPrivateKey: nesKey.privateKey!.toString('hex'),
  });
}

/**
 * Create an oyl-sdk Provider pointing at the devnet.
 */
export function createTestProvider(): Provider {
  return new Provider({
    url: 'http://localhost:18888',
    version: '',
    projectId: '',
    network: network.regtest,
    networkType: 'regtest',
  });
}

/**
 * Gather UTXOs for the test account in oyl-sdk FormattedUtxo format.
 */
export async function gatherUtxos(account: Account): Promise<FormattedUtxo[]> {
  const addresses = [
    account.nativeSegwit.address,
    account.taproot.address,
  ];

  const allUtxos: FormattedUtxo[] = [];

  for (const address of addresses) {
    const rawUtxos = await rpcCall('esplora_address::utxo', [address]);
    for (const u of rawUtxos) {
      // Get the raw tx to build the UTXO
      const rawHex = await rpcCall('btc_getrawtransaction', [u.txid]);

      // Parse the raw tx to get the scriptPubKey for this output
      const prevTx = bitcoin.Transaction.fromHex(rawHex);
      const scriptPk = prevTx.outs[u.vout]?.script?.toString('hex') ?? '';

      allUtxos.push({
        txId: u.txid,
        outputIndex: u.vout,
        satoshis: u.value,
        value: u.value,
        scriptPk,
        address,
        indexed: true,
        inscriptions: [],
        runes: {},
        alkanes: {},
        confirmations: 1,
      } as any);
    }
  }

  return allUtxos;
}

/**
 * Encode a protostone for an alkanes execute call.
 *
 * Format: calldata as u128[] values encoded into a protorune protostone.
 */
export function buildProtostone(calldata: bigint[]): Buffer {
  const { encodeProtostone } = require('../../src/alkanes/alkanes');
  return encodeProtostone({
    protostoneFields: {
      calldata,
      refundPointer: 0,
      pointer: 0,
    },
  });
}
