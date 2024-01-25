import * as blst from "../../temp-deps/blst-ts/lib/index.js";
import {bytesToHex, hexToBytes, isZeroUint8Array, randomBytes} from "../helpers/index.js";
import {SECRET_KEY_LENGTH} from "../constants.js";
import {SecretKey as ISecretKey} from "../types.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {ZeroSecretKeyError} from "../errors.js";

export class SecretKey implements ISecretKey {
  constructor(private readonly key: blst.SecretKey) {}

  static fromBytes(bytes: Uint8Array): SecretKey {
    // draft-irtf-cfrg-bls-signature-04 does not allow SK == 0
    if (isZeroUint8Array(bytes)) {
      throw new ZeroSecretKeyError();
    }

    const sk = blst.SecretKey.deserialize(bytes);
    return new SecretKey(sk);
  }

  static fromHex(hex: string): SecretKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static fromKeygen(entropy?: Uint8Array): SecretKey {
    const sk = blst.SecretKey.fromKeygen(entropy ?? randomBytes(SECRET_KEY_LENGTH));
    return new SecretKey(sk);
  }

  sign(message: Uint8Array): Signature {
    return new Signature(this.key.sign(message));
  }

  toPublicKey(): PublicKey {
    const pk = this.key.toPublicKey();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (PublicKey as any).friendBuild(pk);
  }

  toBytes(): Uint8Array {
    return this.key.serialize();
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
