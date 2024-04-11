import type {PublicKeyType} from "bls-eth-wasm";
import {getContext} from "./context.js";
import {bytesToHex, hexToBytes, isZeroUint8Array} from "../helpers/index.js";
import {PointFormat, PublicKey as IPublicKey} from "../types.js";
import {EmptyAggregateError, InvalidLengthError, ZeroPublicKeyError} from "../errors.js";
import {PUBLIC_KEY_LENGTH_COMPRESSED, PUBLIC_KEY_LENGTH_UNCOMPRESSED} from "../constants.js";

export class PublicKey implements IPublicKey {
  readonly value: PublicKeyType;

  constructor(value: PublicKeyType) {
    if (value.isZero()) {
      throw new ZeroPublicKeyError();
    }

    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): PublicKey {
    const context = getContext();
    const publicKey = new context.PublicKey();
    if (!isZeroUint8Array(bytes)) {
      if (bytes.length === PUBLIC_KEY_LENGTH_COMPRESSED) {
        publicKey.deserialize(bytes);
      } else if (bytes.length === PUBLIC_KEY_LENGTH_UNCOMPRESSED) {
        publicKey.deserializeUncompressed(bytes);
      } else {
        throw new InvalidLengthError("PublicKey", bytes.length);
      }
    }
    return new PublicKey(publicKey);
  }

  static fromHex(hex: string): PublicKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(publicKeys: PublicKey[]): PublicKey {
    if (publicKeys.length === 0) {
      throw new EmptyAggregateError();
    }

    const agg = new PublicKey(publicKeys[0].value.clone());
    for (const pk of publicKeys.slice(1)) {
      agg.value.add(pk.value);
    }
    return agg;
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

  multiplyBy(_bytes: Uint8Array): PublicKey {
    // TODO: I found this in the code but its not exported. Need to figure out
    //       how to implement
    // const a = getContext();
    // const randomness = new a.FR(8);
    // return new PublicKey(a.mul(this.value, randomness));
    throw new Error("multiplyBy is not implemented by bls-eth-wasm");
  }
}
