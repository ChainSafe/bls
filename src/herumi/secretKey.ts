import type {SecretKeyType} from "bls-eth-wasm";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import {SECRET_KEY_LENGTH} from "../constants.js";
import {getContext} from "./context.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {SecretKey as ISecretKey} from "../types.js";
import {InvalidLengthError, ZeroSecretKeyError} from "../errors.js";

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
    const sk = generateRandomSecretKey(entropy);
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
