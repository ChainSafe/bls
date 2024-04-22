import {IBls, PublicKeyArg, SignatureArg, SignatureSet} from "./types.js";
import {validateBytes} from "./helpers/index.js";
import {NotInitializedError} from "./errors.js";

/**
 * NOTE:
 *
 * This conditional block below is present in most functions and is Herumi specific to prevent
 * downstream issues in the WASM code. It is not necessary to validateBytes for blst-native
 * code. The check for blst-native is implemented in the native layer.  All other byte checks
 * for the herumi code paths are found in the herumi classes for performance reasons as they
 * are byte-wise, only are required for the WASM and will unnecessarily slow down the 
 * blst-native side.
 */
// if (implementation === "herumi" && signature instanceof Uint8Array) {
//   validateBytes(signature, "signature");
// }

// Returned type is enforced at each implementation's index
// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
export function functionalInterfaceFactory({
  implementation,
  SecretKey,
  PublicKey,
  Signature,
}: Pick<IBls, "implementation" | "SecretKey" | "PublicKey" | "Signature">) {
  /**
   * Signs given message using secret key.
   */
  function sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array {
    validateBytes(secretKey, "secretKey");
    validateBytes(message, "message");

    return SecretKey.fromBytes(secretKey).sign(message).toBytes();
  }

  /**
   * Compines all given signature into one.
   */
  function aggregateSignatures(signatures: SignatureArg[]): Uint8Array {
    return Signature.aggregate(signatures).toBytes();
  }

  /**
   * Combines all given public keys into single one
   */
  function aggregatePublicKeys(publicKeys: PublicKeyArg[]): Uint8Array {
    return PublicKey.aggregate(publicKeys).toBytes();
  }

  /**
   * Verifies if signature is message signed with given public key.
   */
  function verify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): boolean {
    try {
      if (implementation === "herumi" && signature instanceof Uint8Array) {
        validateBytes(signature, "signature");
      }

      const sig = signature instanceof Signature ? signature : Signature.fromBytes(signature);
      return sig.verify(publicKey, message);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if aggregated signature is same message signed with given public keys.
   */
  function verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array, signature: SignatureArg): boolean {
    try {
      if (implementation === "herumi" && signature instanceof Uint8Array) {
        validateBytes(signature, "signature");
      }

      const sig = signature instanceof Signature ? signature : Signature.fromBytes(signature);
      return sig.verifyAggregate(publicKeys, message);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if signature is list of message signed with corresponding public key.
   */
  function verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg): boolean {
    // TODO: (@matthewkeil) blst-ts has this check but throws an error instead of returning false.  Moving to
    //       the herumi and commenting here for now.  Will double check spec on what is appropriate.
    // if (publicKeys.length === 0 || publicKeys.length != messages.length) {
    //   return false;
    // }
    try {
      if (implementation === "herumi" && signature instanceof Uint8Array) {
        validateBytes(signature, "signature");
      }

      const sig = signature instanceof Signature ? signature : Signature.fromBytes(signature);
      return sig.verifyMultiple(publicKeys, messages);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies multiple signatures at once returning true if all valid or false
   * if at least one is not. Optimization useful when knowing which signature is
   * wrong is not relevant, i.e. verifying an entire Eth2.0 block.
   *
   * This method provides a safe way to do so by multiplying each signature by
   * a random number so an attacker cannot craft a malicious signature that won't
   * verify on its own but will if it's added to a specific predictable signature
   * https://ethresear.ch/t/fast-verification-of-multiple-bls-signatures/5407
   */
  function verifyMultipleSignatures(sets: SignatureSet[]): boolean {
    try {
      return Signature.verifyMultipleSignatures(sets);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if signature is message signed with given public key.
   */
  async function asyncVerify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): Promise<boolean> {
    if (implementation === "herumi") return verify(publicKey, message, signature);
    try {
      // must be in try/catch in case sig is invalid
      const sig = signature instanceof Signature ? signature : Signature.fromBytes(signature);
      return sig.asyncVerify(publicKey, message);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if aggregated signature is same message signed with given public keys.
   */
  async function asyncVerifyAggregate(
    publicKeys: PublicKeyArg[],
    message: Uint8Array,
    signature: SignatureArg
  ): Promise<boolean> {
    if (implementation === "herumi") return verifyAggregate(publicKeys, message, signature);
    try {
      const sig = signature instanceof Signature ? signature : Signature.fromBytes(signature);
      return sig.asyncVerifyAggregate(publicKeys, message);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if signature is list of message signed with corresponding public key.
   */
  async function asyncVerifyMultiple(
    publicKeys: PublicKeyArg[],
    messages: Uint8Array[],
    signature: SignatureArg
  ): Promise<boolean> {
    if (implementation === "herumi") return verifyMultiple(publicKeys, messages, signature);
    try {
      const sig = signature instanceof Signature ? signature : Signature.fromBytes(signature);
      return sig.asyncVerifyMultiple(publicKeys, messages);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies multiple signatures at once returning true if all valid or false
   * if at least one is not. Optimization useful when knowing which signature is
   * wrong is not relevant, i.e. verifying an entire Eth2.0 block.
   *
   * This method provides a safe way to do so by multiplying each signature by
   * a random number so an attacker cannot craft a malicious signature that won't
   * verify on its own but will if it's added to a specific predictable signature
   * https://ethresear.ch/t/fast-verification-of-multiple-bls-signatures/5407
   */
  async function asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean> {
    try {
      if (implementation === "herumi") return Signature.verifyMultipleSignatures(sets);
      return Signature.asyncVerifyMultipleSignatures(sets);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Computes a public key from a secret key
   */
  function secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array {
    validateBytes(secretKey, "secretKey");
    return SecretKey.fromBytes(secretKey).toPublicKey().toBytes();
  }

  return {
    sign,
    aggregateSignatures,
    aggregatePublicKeys,
    verify,
    asyncVerify,
    verifyAggregate,
    asyncVerifyAggregate,
    verifyMultiple,
    asyncVerifyMultiple,
    verifyMultipleSignatures,
    asyncVerifyMultipleSignatures,
    secretKeyToPublicKey,
  };
}
