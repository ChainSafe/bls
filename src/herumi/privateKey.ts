import assert from "assert";
import {SecretKeyType} from "bls-eth-wasm";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import {SECRET_KEY_LENGTH} from "../constants";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {bytesToHex, hexToBytes} from "../helpers";
import {IPrivateKey} from "../interface";

export class PrivateKey implements IPrivateKey {
  readonly value: SecretKeyType;

  constructor(value: SecretKeyType) {
    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): PrivateKey {
    assert(bytes.length === SECRET_KEY_LENGTH, "Private key should have 32 bytes");
    const context = getContext();
    const secretKey = new context.SecretKey();
    secretKey.deserialize(bytes);
    return new PrivateKey(secretKey);
  }

  static fromHex(hex: string): PrivateKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static fromKeygen(entropy?: Uint8Array): PrivateKey {
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
