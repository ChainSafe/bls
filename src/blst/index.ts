import assert from "assert";
import {Keypair} from "./keypair";
import {PrivateKey} from "./privateKey";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {toBuffer} from "../helpers/utils";
export * from "../constants";

export {Keypair, PrivateKey, PublicKey, Signature};

export async function initBLS(): Promise<void> {
  // Native bindings require no init() call
}
export function destroy(): void {
  // Native bindings require no destroy() call
}

/**
 * Generates new secret and public key
 */
export function generateKeyPair(): Keypair {
  return Keypair.generate();
}

/**
 * Generates public key from given secret.
 * @param {BLSSecretKey} secretKey
 */
export function generatePublicKey(secretKey: Uint8Array): Buffer {
  assert(secretKey, "secretKey is null or undefined");
  const keypair = new Keypair(PrivateKey.fromBytes(toBuffer(secretKey)));
  return keypair.publicKey.toBytes();
}

/**
 * Signs given message using secret key.
 * @param secretKey
 * @param messageHash
 */
export function sign(secretKey: Uint8Array, messageHash: Uint8Array): Buffer {
  assert(secretKey, "secretKey is null or undefined");
  assert(messageHash, "messageHash is null or undefined");
  const privateKey = PrivateKey.fromBytes(toBuffer(secretKey));
  return privateKey.signMessage(toBuffer(messageHash)).toBytes();
}

/**
 * Compines all given signature into one.
 * @param signatures
 */
export function aggregateSignatures(signatures: Uint8Array[]): Buffer {
  const agg = Signature.aggregate(signatures.map((p) => Signature.fromBytes(p)));
  return agg.toBytes();
}

/**
 * Combines all given public keys into single one
 * @param publicKeys
 */
export function aggregatePubkeys(publicKeys: Uint8Array[]): Buffer {
  const agg = PublicKey.aggregate(publicKeys.map((p) => PublicKey.fromBytes(p)));
  return agg.toBytes();
}

/**
 * Verifies if signature is message signed with given public key.
 * @param publicKey
 * @param messageHash
 * @param signature
 */
export function verify(publicKey: Uint8Array, messageHash: Uint8Array, signature: Uint8Array): boolean {
  assert(publicKey, "publicKey is null or undefined");
  assert(messageHash, "messageHash is null or undefined");
  assert(signature, "signature is null or undefined");
  try {
    return PublicKey.fromBytes(publicKey).verifyMessage(
      Signature.fromBytes(toBuffer(signature)),
      toBuffer(messageHash)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Verifies if aggregated signature is same message signed with given public keys.
 * @param publicKeys
 * @param messageHash
 * @param signature
 */
export function verifyAggregate(publicKeys: Uint8Array[], messageHash: Uint8Array, signature: Uint8Array): boolean {
  assert(publicKeys, "publicKey is null or undefined");
  assert(messageHash, "messageHash is null or undefined");
  assert(signature, "signature is null or undefined");
  try {
    return Signature.fromBytes(signature).verifyAggregate(
      publicKeys.map((pubkey) => PublicKey.fromBytes(pubkey)),
      messageHash
    );
  } catch (e) {
    return false;
  }
}

/**
 * Verifies if signature is list of message signed with corresponding public key.
 * @param publicKeys
 * @param messageHashes
 * @param signature
 * @param fast Check if all messages are different
 */
export function verifyMultiple(publicKeys: Uint8Array[], messageHashes: Uint8Array[], signature: Uint8Array): boolean {
  assert(publicKeys, "publicKey is null or undefined");
  assert(messageHashes, "messageHash is null or undefined");
  assert(signature, "signature is null or undefined");

  if (publicKeys.length === 0 || publicKeys.length != messageHashes.length) {
    return false;
  }
  try {
    return Signature.fromBytes(toBuffer(signature)).verifyMultiple(
      publicKeys.map((key) => PublicKey.fromBytes(toBuffer(key))),
      messageHashes.map((m) => toBuffer(m))
    );
  } catch (e) {
    return false;
  }
}

export default {
  generateKeyPair,
  generatePublicKey,
  sign,
  aggregateSignatures,
  aggregatePubkeys,
  verify,
  verifyAggregate,
  verifyMultiple,

  Keypair,
  PrivateKey,
  PublicKey,
  Signature,
  initBLS,
  destroy,
};
