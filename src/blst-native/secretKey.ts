import * as blst from "@chainsafe/blst";
import {bytesToHex, hexToBytes, isZeroUint8Array, randomBytes} from "../helpers/index.js";
import {SECRET_KEY_LENGTH} from "../constants.js";
import {SecretKey as ISecretKey} from "../interface.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {ZeroSecretKeyError} from "../errors.js";

export class SecretKey implements ISecretKey {
  readonly value: blst.SecretKey;
  constructor(value: blst.SecretKey) {
    this.value = value;
  }

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
    const sk = blst.SecretKey.fromKeygen(entropy || randomBytes(SECRET_KEY_LENGTH));
    return new SecretKey(sk);
  }

  sign(message: Uint8Array): Signature {
    return new Signature(this.value.sign(message).value);
  }

  toPublicKey(): PublicKey {
    const pk = this.value.toPublicKey();
    return new PublicKey(pk.value);
  }

  toBytes(): Uint8Array {
    return this.value.toBytes();
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
