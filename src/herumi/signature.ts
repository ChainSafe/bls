import type {SignatureType} from "bls-eth-wasm";
import {getContext} from "./context.js";
import {PublicKey} from "./publicKey.js";
import {bytesToHex, concatUint8Arrays, hexToBytes, isZeroUint8Array} from "../helpers/index.js";
import {PointFormat, Signature as ISignature, CoordType} from "../types.js";
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

  static aggregate(signatures: Signature[]): Signature {
    if (signatures.length === 0) {
      throw new EmptyAggregateError();
    }

    const context = getContext();
    const signature = new context.Signature();
    signature.aggregate(signatures.map((sig) => sig.value));
    return new Signature(signature);
  }

  static verifyMultipleSignatures(sets: {publicKey: PublicKey; message: Uint8Array; signature: Signature}[]): boolean {
    const context = getContext();
    return context.multiVerify(
      sets.map((s) => s.publicKey.value),
      sets.map((s) => s.signature.value),
      sets.map((s) => s.message)
    );
  }

  verify(publicKey: PublicKey, message: Uint8Array): boolean {
    return publicKey.value.verify(this.value, message);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return this.value.fastAggregateVerify(
      publicKeys.map((key) => key.value),
      message
    );
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    return this.value.aggregateVerifyNoCheck(
      publicKeys.map((key) => key.value),
      concatUint8Arrays(messages)
    );
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
}
