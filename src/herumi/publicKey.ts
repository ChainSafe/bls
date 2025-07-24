import {PublicKeyType} from "bls-eth-wasm";
import {getContext} from "./context.js";
import {bytesToHex, hexToBytes, isZeroUint8Array} from "../helpers/index.js";
import {PublicKey as IPublicKey} from "../types.js";
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
    const context = getContext();
    const agg = new context.PublicKey();
    for (const publicKey of publicKeys) {
      agg.add(publicKey["value"]);
    }
    return new PublicKey(agg);
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
