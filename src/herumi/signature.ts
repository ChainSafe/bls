import type {SignatureType} from "bls-eth-wasm";
import {getContext} from "./context.js";
import {PublicKey} from "./publicKey.js";
import {bytesToHex, concatUint8Arrays, hexToBytes, isZeroUint8Array, validateBytes} from "../helpers/index.js";
import {SignatureSet, Signature as ISignature} from "../types.js";
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
   * @param validate With `herumi` implementation signature validation is always on regardless of this flag.
   */
  static fromBytes(bytes: Uint8Array, _validate = true): Signature {
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
    const agg = new context.Signature();
    agg.aggregate(signatures.map((sig) => sig["value"]));
    return new Signature(agg);
  }

  static verifyMultipleSignatures(sets: SignatureSet[]): boolean {
    if (!sets) throw Error("sets is null or undefined");

    const context = getContext();
    return context.multiVerify(
      sets.map((s) => (s.publicKey as PublicKey)["value"]),
      sets.map((s) => (s.signature as Signature)["value"]),
      sets.map((s) => s.message)
    );
  }

  verify(publicKey: PublicKey, message: Uint8Array): boolean {
    validateBytes(message, "message");
    return publicKey["value"].verify(this.value, message);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    validateBytes(message, "message");
    return this.value.fastAggregateVerify(
      publicKeys.map((pk) => pk["value"]),
      message
    );
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    // TODO: (@matthewkeil) this was in the verifyMultiple free function but was moved here for herumi. blst-native
    //       does this check but throws error instead of returning false.  Need to double check spec on which is
    //       correct handling
    if (publicKeys.length === 0 || publicKeys.length != messages.length) {
      return false;
    }

    validateBytes(messages, "message");

    return this.value.aggregateVerifyNoCheck(
      publicKeys.map((pk) => pk["value"]),
      concatUint8Arrays(messages)
    );
  }

  toBytes(compress = true): Uint8Array {
    if (!compress) {
      return this.value.serializeUncompressed();
    } else {
      return this.value.serialize();
    }
  }

  toHex(compress = true): string {
    return bytesToHex(this.toBytes(compress));
  }
}
