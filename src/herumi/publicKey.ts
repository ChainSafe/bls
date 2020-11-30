import {PublicKeyType} from "bls-eth-wasm";
import {getContext} from "./context";
import {PUBLIC_KEY_LENGTH} from "../constants";
import {bytesToHex, hexToBytes, isZeroUint8Array} from "../helpers";
import {IPublicKey} from "../interface";
import {EmptyAggregateError, InvalidLengthError, ZeroPublicKeyError} from "../errors";

export class PublicKey implements IPublicKey {
  readonly value: PublicKeyType;

  constructor(value: PublicKeyType) {
    if (value.isZero()) {
      throw new ZeroPublicKeyError();
    }

    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): PublicKey {
    if (bytes.length !== PUBLIC_KEY_LENGTH) {
      throw new InvalidLengthError("PublicKey", PUBLIC_KEY_LENGTH);
    }

    const context = getContext();
    const publicKey = new context.PublicKey();
    if (!isZeroUint8Array(bytes)) {
      publicKey.deserialize(bytes);
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

  toBytes(): Uint8Array {
    return this.value.serialize();
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
