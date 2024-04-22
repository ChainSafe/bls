import type {SignatureType} from "bls-eth-wasm";
import {getContext} from "./context.js";
import {PublicKey} from "./publicKey.js";
import {bytesToHex, concatUint8Arrays, hexToBytes, isZeroUint8Array, validateBytes} from "../helpers/index.js";
import {SignatureSet, PointFormat, Signature as ISignature, CoordType, PublicKeyArg, SignatureArg} from "../types.js";
import {EmptyAggregateError, InvalidLengthError, InvalidOrderError} from "../errors.js";
import {SIGNATURE_LENGTH_COMPRESSED, SIGNATURE_LENGTH_UNCOMPRESSED} from "../constants.js";

export class Signature implements ISignature {
  readonly value: SignatureType;

  constructor(value: SignatureType) {
    if (!value.isValidOrder()) {
      throw new InvalidOrderError();
    }

    this.value = value;
  }

  /**
   * @param type Does not affect `herumi` implementation, always de-serializes to `jacobian`
   * @param validate With `herumi` implementation signature validation is always on regardless of this flag.
   */
  static fromBytes(bytes: Uint8Array, _type?: CoordType, _validate = true): Signature {
    const context = getContext();
    const signature = new context.Signature();
    if (!isZeroUint8Array(bytes)) {
      if (bytes.length === SIGNATURE_LENGTH_COMPRESSED) {
        signature.deserialize(bytes);
      } else if (bytes.length === SIGNATURE_LENGTH_UNCOMPRESSED) {
        signature.deserializeUncompressed(bytes);
      } else {
        throw new InvalidLengthError("Signature", bytes.length);
      }
      signature.deserialize(bytes);
    }
    return new Signature(signature);
  }

  static fromHex(hex: string): Signature {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(signatures: SignatureArg[]): Signature {
    if (signatures.length === 0) {
      throw new EmptyAggregateError();
    }

    const context = getContext();
    const agg = new context.Signature();
    agg.aggregate(signatures.map(Signature.convertToSignatureType));
    return new Signature(agg);
  }

  static verifyMultipleSignatures(sets: SignatureSet[]): boolean {
    if (!sets) throw Error("sets is null or undefined");

    const context = getContext();
    return context.multiVerify(
      sets.map((s) => PublicKey.convertToPublicKeyType(s.publicKey)),
      sets.map((s) => Signature.convertToSignatureType(s.signature)),
      sets.map((s) => s.message)
    );
  }

  static async asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean> {
    return Signature.verifyMultipleSignatures(sets);
  }

  static convertToSignatureType(signature: SignatureArg): SignatureType {
    let sig: Signature;
    if (signature instanceof Uint8Array) {
      validateBytes(signature, "signature");
      sig = Signature.fromBytes(signature);
    } else {
      // need to cast to herumi sig instead of ISignature
      sig = signature as Signature;
    }
    return sig.value;
  }

  verify(publicKey: PublicKeyArg, message: Uint8Array): boolean {
    validateBytes(message, "message");
    return PublicKey.convertToPublicKeyType(publicKey).verify(this.value, message);
  }

  verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): boolean {
    validateBytes(message, "message");
    return this.value.fastAggregateVerify(publicKeys.map(PublicKey.convertToPublicKeyType), message);
  }

  verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): boolean {
    // TODO: (@matthewkeil) this was in the verifyMultiple free function but was moved here for herumi. blst-native
    //       does this check but throws error instead of returning false.  Need to double check spec on which is
    //       correct handling
    if (publicKeys.length === 0 || publicKeys.length != messages.length) {
      return false;
    }

    validateBytes(messages, "message");

    return this.value.aggregateVerifyNoCheck(
      publicKeys.map(PublicKey.convertToPublicKeyType),
      concatUint8Arrays(messages)
    );
  }

  async asyncVerify(publicKey: PublicKey, message: Uint8Array): Promise<boolean> {
    return this.verify(publicKey, message);
  }

  async asyncVerifyAggregate(publicKeys: PublicKey[], message: Uint8Array): Promise<boolean> {
    return this.verifyAggregate(publicKeys, message);
  }

  async asyncVerifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): Promise<boolean> {
    return this.verifyMultiple(publicKeys, messages);
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.value.serializeUncompressed();
    } else {
      return this.value.serialize();
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }

  multiplyBy(_bytes: Uint8Array): Signature {
    // TODO: I found this in the code but its not exported. Need to figure out
    //       how to implement
    // const a = getContext();
    // const randomness = new a.FR(8);
    // return new Signature(a.mul(this.value, randomness));
    throw new Error("multiplyBy is not implemented by bls-eth-wasm");
  }
}
