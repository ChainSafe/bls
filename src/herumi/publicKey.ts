import {PublicKeyType} from "bls-eth-wasm";
import {getContext} from "./context";
import {EMPTY_PUBLIC_KEY} from "../constants";
import {Signature} from "./signature";
import {bytesToHex, hexToBytes, isEqualBytes} from "../helpers";
import {IPublicKey} from "../interface";

export class PublicKey implements IPublicKey {
  readonly value: PublicKeyType;

  constructor(value: PublicKeyType) {
    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): PublicKey {
    const context = getContext();
    const publicKey = new context.PublicKey();
    if (!isEqualBytes(EMPTY_PUBLIC_KEY, bytes)) {
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

  add(other: PublicKey): PublicKey {
    const agg = new PublicKey(this.value.clone());
    agg.value.add(other.value);
    return agg;
  }

  verifyMessage(signature: Signature, message: Uint8Array): boolean {
    return this.value.verify(signature.value, message);
  }

  toBytes(): Uint8Array {
    return this.value.serialize();
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
