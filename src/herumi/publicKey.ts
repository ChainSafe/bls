import {PublicKeyType} from "@chainsafe/eth2-bls-wasm";
import {getContext} from "./context";
import {EMPTY_PUBLIC_KEY} from "../constants";
import {Signature} from "./signature";
import {bytesToHex, hexToBytes} from "../helpers/utils";

export class PublicKey {
  readonly value: PublicKeyType;

  constructor(value: PublicKeyType) {
    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): PublicKey {
    const context = getContext();
    const publicKey = new context.PublicKey();
    if (!EMPTY_PUBLIC_KEY.equals(bytes)) {
      publicKey.deserialize(bytes);
    }
    return new PublicKey(publicKey);
  }

  static fromHex(hex: string): PublicKey {
    return this.fromBytes(hexToBytes(hex));
  }

  add(other: PublicKey): PublicKey {
    const agg = new PublicKey(this.value.clone());
    agg.value.add(other.value);
    return agg;
  }

  verifyMessage(signature: Signature, messageHash: Uint8Array): boolean {
    return this.value.verify(signature.value, messageHash);
  }

  toBytes(): Buffer {
    return Buffer.from(this.value.serialize());
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
