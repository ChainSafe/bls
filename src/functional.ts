import blst from "@chainsafe/blst";
import {IBls, PublicKey, PublicKeyArg, Signature, SignatureArg, SignatureSet} from "./types.js";
import {validateBytes} from "./helpers/index.js";
import {NotInitializedError} from "./errors.js";

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
    const agg = Signature.aggregate(
      signatures.map((sig) => (sig instanceof Uint8Array ? Signature.fromBytes(sig) : sig))
    );
    return agg.toBytes();
  }

  /**
   * Combines all given public keys into single one
   */
  function aggregatePublicKeys(publicKeys: PublicKeyArg[]): Uint8Array {
    const agg = PublicKey.aggregate(publicKeys.map((pk) => (pk instanceof Uint8Array ? PublicKey.fromBytes(pk) : pk)));
    return agg.toBytes();
  }

  /**
   * Verifies if signature is message signed with given public key.
   */
  function verify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): boolean {
    try {
      validateBytes(message, "message");

      let pk: PublicKey;
      if (publicKey instanceof Uint8Array) {
        validateBytes(publicKey, "publicKey");
        pk = PublicKey.fromBytes(publicKey);
      } else {
        pk = publicKey;
      }

      let sig: Signature;
      if (signature instanceof Uint8Array) {
        validateBytes(signature, "signature");
        sig = Signature.fromBytes(signature);
      } else {
        sig = signature;
      }

      return sig.verify(pk, message);
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
      validateBytes(message, "message");

      const pks: PublicKey[] = [];
      for (const pk of publicKeys) {
        if (pk instanceof Uint8Array) {
          validateBytes(pk, "publicKey");
          pks.push(PublicKey.fromBytes(pk));
        } else {
          pks.push(pk);
        }
      }

      let sig: Signature;
      if (signature instanceof Uint8Array) {
        validateBytes(signature, "signature");
        sig = Signature.fromBytes(signature);
      } else {
        sig = signature;
      }

      return sig.verifyAggregate(pks, message);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if signature is list of message signed with corresponding public key.
   */
  function verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg): boolean {
    if (publicKeys.length === 0 || publicKeys.length != messages.length) {
      return false;
    }

    try {
      validateBytes(messages, "message");

      const pks: PublicKey[] = [];
      for (const pk of publicKeys) {
        if (pk instanceof Uint8Array) {
          validateBytes(pk, "publicKey");
          pks.push(PublicKey.fromBytes(pk));
        } else {
          pks.push(pk);
        }
      }

      let sig: Signature;
      if (signature instanceof Uint8Array) {
        validateBytes(signature, "signature");
        sig = Signature.fromBytes(signature);
      } else {
        sig = signature;
      }

      return sig.verifyMultiple(pks, messages);
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
    if (!sets) throw Error("sets is null or undefined");

    try {
      return Signature.verifyMultipleSignatures(
        sets.map((s) => ({
          publicKey: s.publicKey instanceof Uint8Array ? PublicKey.fromBytes(s.publicKey) : s.publicKey,
          message: s.message,
          signature: s.signature instanceof Uint8Array ? Signature.fromBytes(s.signature) : s.signature,
        }))
      );
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  function convertToBlstPublicKeyArg(publicKey: PublicKeyArg): blst.PublicKeyArg {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return publicKey instanceof PublicKey ? ((publicKey as any).value as blst.PublicKey) : publicKey;
  }

  function convertToBlstSignatureArg(signature: SignatureArg): blst.SignatureArg {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return signature instanceof Signature ? ((signature as any).value as blst.Signature) : signature;
  }

  /**
   * Verifies if signature is message signed with given public key.
   */
  async function asyncVerify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): Promise<boolean> {
    if (implementation === "herumi") return verify(publicKey, message, signature);
    try {
      return blst.asyncVerify(message, convertToBlstPublicKeyArg(publicKey), convertToBlstSignatureArg(signature));
    } catch {
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
      return blst.asyncFastAggregateVerify(
        message,
        publicKeys.map((key) => convertToBlstPublicKeyArg(key)),
        convertToBlstSignatureArg(signature)
      );
    } catch {
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
      return blst.asyncAggregateVerify(
        messages,
        publicKeys.map((key) => convertToBlstPublicKeyArg(key)),
        convertToBlstSignatureArg(signature)
      );
    } catch {
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
    if (implementation === "herumi") return verifyMultipleSignatures(sets);
    try {
      return blst.asyncVerifyMultipleAggregateSignatures(
        sets.map((set) => ({
          message: set.message,
          publicKey: convertToBlstPublicKeyArg(set.publicKey),
          signature: convertToBlstSignatureArg(set.signature),
        }))
      );
    } catch {
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
