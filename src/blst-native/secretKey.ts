import crypto from "crypto";
import blst from "@chainsafe/blst";
import {SecretKey as ISecretKey} from "../types.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {isZeroUint8Array} from "../helpers/utils.js";
import {ZeroSecretKeyError} from "../errors.js";

export class SecretKey implements ISecretKey {
  constructor(private readonly value: blst.SecretKey) {}

  static fromBytes(bytes: Uint8Array): SecretKey {
    if (isZeroUint8Array(bytes)) {
      throw new ZeroSecretKeyError();
    }

    return new SecretKey(blst.SecretKey.fromBytes(bytes));
  }

  static fromHex(hex: string): SecretKey {
    return new SecretKey(blst.SecretKey.fromHex(hex));
  }

  static fromKeygen(entropy?: Uint8Array): SecretKey {
    return new SecretKey(blst.SecretKey.fromKeygen(entropy ?? crypto.getRandomValues(new Uint8Array(32))));
  }

  sign(message: Uint8Array): Signature {
    return new Signature(this.value.sign(message));
  }

  toPublicKey(): PublicKey {
    return new PublicKey(this.value.toPublicKey());
  }

  toBytes(): Uint8Array {
    return this.value.toBytes();
  }

  toHex(): string {
    return this.value.toHex();
  }
}
