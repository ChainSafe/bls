import {assert} from "./helpers";
import {IBls} from "./interface";

// Returned type is enforced at each implementation's index
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function functionalInterfaceFactory({
  PrivateKey,
  PublicKey,
  Signature,
}: Pick<IBls, "PrivateKey" | "PublicKey" | "Signature">) {
  /**
   * Signs given message using secret key.
   * @param secretKey
   * @param messageHash
   */
  function sign(secretKey: Uint8Array, messageHash: Uint8Array): Buffer {
    assert(secretKey, "secretKey is null or undefined");
    assert(messageHash, "messageHash is null or undefined");
    const privateKey = PrivateKey.fromBytes(secretKey);
    return privateKey.signMessage(messageHash).toBytes();
  }

  /**
   * Compines all given signature into one.
   * @param signatures
   */
  function aggregateSignatures(signatures: Uint8Array[]): Buffer {
    const agg = Signature.aggregate(signatures.map((p) => Signature.fromBytes(p)));
    return agg.toBytes();
  }

  /**
   * Combines all given public keys into single one
   * @param publicKeys
   */
  function aggregatePubkeys(publicKeys: Uint8Array[]): Buffer {
    const agg = PublicKey.aggregate(publicKeys.map((p) => PublicKey.fromBytes(p)));
    return agg.toBytes();
  }

  /**
   * Verifies if signature is message signed with given public key.
   * @param publicKey
   * @param messageHash
   * @param signature
   */
  function verify(publicKey: Uint8Array, messageHash: Uint8Array, signature: Uint8Array): boolean {
    assert(publicKey, "publicKey is null or undefined");
    assert(messageHash, "messageHash is null or undefined");
    assert(signature, "signature is null or undefined");
    try {
      return Signature.fromBytes(signature).verify(PublicKey.fromBytes(publicKey), messageHash);
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
  function verifyAggregate(publicKeys: Uint8Array[], messageHash: Uint8Array, signature: Uint8Array): boolean {
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
  function verifyMultiple(publicKeys: Uint8Array[], messageHashes: Uint8Array[], signature: Uint8Array): boolean {
    assert(publicKeys, "publicKey is null or undefined");
    assert(messageHashes, "messageHash is null or undefined");
    assert(signature, "signature is null or undefined");

    if (publicKeys.length === 0 || publicKeys.length != messageHashes.length) {
      return false;
    }
    try {
      return Signature.fromBytes(signature).verifyMultiple(
        publicKeys.map((publicKey) => PublicKey.fromBytes(publicKey)),
        messageHashes.map((msg) => msg)
      );
    } catch (e) {
      return false;
    }
  }

  return {
    sign,
    aggregateSignatures,
    aggregatePubkeys,
    verify,
    verifyAggregate,
    verifyMultiple,
  };
}
