import {PublicKeyType} from "bls-eth-wasm";
import {getContext} from "./context";
import {PUBLIC_KEY_LENGTH} from "../constants";
import {bytesToHex, hexToBytes, isZeroUint8Array} from "../helpers";
import {IPublicKey} from "../interface";
import {ZeroPublicKeyError} from "../errors";

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
      throw Error(`Public key must have ${PUBLIC_KEY_LENGTH} bytes`);
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

  static aggregate(pubkeys: PublicKey[]): PublicKey {
    if (pubkeys.length === 0) {
      throw Error("EMPTY_AGGREGATE_ARRAY");
    }

    const agg = new PublicKey(pubkeys[0].value.clone());
    for (const pk of pubkeys.slice(1)) {
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
