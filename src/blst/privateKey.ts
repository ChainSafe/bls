import * as blst from "@chainsafe/blst";
import {bytesToHex, getRandomBytes, hexToBytes} from "../helpers/utils";
import {IPrivateKey} from "../interface";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";

export class PrivateKey implements IPrivateKey {
  readonly value: blst.SecretKey;

  constructor(value: blst.SecretKey) {
    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): PrivateKey {
    const sk = blst.SecretKey.fromBytes(bytes);
    return new PrivateKey(sk);
  }

  static fromHex(hex: string): PrivateKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static fromKeygen(entropy?: Uint8Array): PrivateKey {
    const sk = blst.SecretKey.fromKeygen(entropy || getRandomBytes(32));
    return new PrivateKey(sk);
  }

  signMessage(message: Uint8Array): Signature {
    return new Signature(this.value.sign(message));
  }

  toPublicKey(): PublicKey {
    const jacobian = this.value.toAggregatePublicKey();
    const affine = jacobian.toPublicKey();
    return new PublicKey(affine, jacobian);
  }

  toBytes(): Buffer {
    return Buffer.from(this.value.toBytes());
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
