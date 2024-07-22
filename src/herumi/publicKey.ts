import {PublicKeyType} from "bls-eth-wasm";
import {getContext} from "./context.js";
import {bytesToHex, hexToBytes, isZeroUint8Array, validateBytes} from "../helpers/index.js";
import {PointFormat, PublicKey as IPublicKey, PublicKeyArg} from "../types.js";
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

  static aggregate(publicKeys: PublicKeyArg[]): PublicKey {
    if (publicKeys.length === 0) {
      throw new EmptyAggregateError();
    }
    const context = getContext();
    const agg = new context.PublicKey();
    for (const publicKey of publicKeys) {
      agg.add(PublicKey.convertToPublicKeyType(publicKey));
    }
    return new PublicKey(agg);
  }

  static convertToPublicKeyType(publicKey: PublicKeyArg): PublicKeyType {
    let pk: PublicKey;
    if (publicKey instanceof Uint8Array) {
      validateBytes(publicKey, "publicKey");
      pk = PublicKey.fromBytes(publicKey);
    } else {
      // need to cast to herumi key instead of IPublicKey
      pk = publicKey as PublicKey;
    }
    return pk.value;
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
