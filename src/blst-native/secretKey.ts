import blst from "@chainsafe/blst";
import crypto from "crypto";
import {bytesToHex, hexToBytes, isZeroUint8Array} from "../helpers/index.js";
import {SECRET_KEY_LENGTH} from "../constants.js";
import {SecretKey as ISecretKey} from "../types.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {ZeroSecretKeyError} from "../errors.js";

export class SecretKey implements ISecretKey {
  constructor(private readonly value: blst.SecretKey) {}

  static fromBytes(bytes: Uint8Array): SecretKey {
    // draft-irtf-cfrg-bls-signature-04 does not allow SK == 0
    if (isZeroUint8Array(bytes)) {
      throw new ZeroSecretKeyError();
    }

    const sk = blst.SecretKey.fromBytes(bytes);
    return new SecretKey(sk);
  }

  static fromHex(hex: string): SecretKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static fromKeygen(entropy?: Uint8Array): SecretKey {
    const sk = blst.SecretKey.fromKeygen(entropy || crypto.randomBytes(SECRET_KEY_LENGTH));
    return new SecretKey(sk);
  }

  sign(message: Uint8Array): Signature {
    // @ts-expect-error Need to hack private constructor with static method
    return Signature.friendBuild(this.value.sign(message));
  }

  toPublicKey(): PublicKey {
    const pk = this.value.toPublicKey();
    // @ts-expect-error Need to hack private constructor with static method
    return PublicKey.friendBuild(pk);
  }

  toBytes(): Uint8Array {
    return this.value.toBytes();
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
