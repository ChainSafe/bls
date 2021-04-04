import {PublicKeyType} from "bls-eth-wasm";
import {getContext} from "./context";
import {bytesToHex, hexToBytes, isZeroUint8Array} from "../helpers";
import {PointFormat, PublicKey as IPublicKey} from "../interface";
import {EmptyAggregateError, InvalidLengthError, ZeroPublicKeyError} from "../errors";
import {PUBLIC_KEY_LENGTH_COMPRESSED, PUBLIC_KEY_LENGTH_UNCOMPRESSED} from "../constants";

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
}
