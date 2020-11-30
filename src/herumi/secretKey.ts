import {SecretKeyType} from "bls-eth-wasm";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import {SECRET_KEY_LENGTH} from "../constants";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {bytesToHex, hexToBytes} from "../helpers";
import {SecretKey as ISecretKey} from "../interface";
import {InvalidLengthError, ZeroSecretKeyError} from "../errors";

export class SecretKey implements ISecretKey {
  readonly value: SecretKeyType;

  constructor(value: SecretKeyType) {
    if (value.isZero()) {
      throw new ZeroSecretKeyError();
    }

    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): SecretKey {
    if (bytes.length !== SECRET_KEY_LENGTH) {
      throw new InvalidLengthError("SecretKey", SECRET_KEY_LENGTH);
    }

    const context = getContext();
    const secretKey = new context.SecretKey();
    secretKey.deserialize(bytes);
    return new SecretKey(secretKey);
  }

  static fromHex(hex: string): SecretKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static fromKeygen(entropy?: Uint8Array): SecretKey {
    const sk = generateRandomSecretKey(entropy && Buffer.from(entropy));
    return this.fromBytes(sk);
  }

  sign(message: Uint8Array): Signature {
    return new Signature(this.value.sign(message));
  }

  toPublicKey(): PublicKey {
    return new PublicKey(this.value.getPublicKey());
  }

  toBytes(): Uint8Array {
    return this.value.serialize();
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
