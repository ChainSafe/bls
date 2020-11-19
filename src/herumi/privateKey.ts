import assert from "assert";
import {SecretKeyType} from "@chainsafe/eth2-bls-wasm";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import {SECRET_KEY_LENGTH} from "../constants";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {bytesToHex, hexToBytes} from "../helpers/utils";

export class PrivateKey {
  readonly value: SecretKeyType;

  constructor(value: SecretKeyType) {
    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): PrivateKey {
    assert(bytes.length === SECRET_KEY_LENGTH, "Private key should have 32 bytes");
    const context = getContext();
    const secretKey = new context.SecretKey();
    secretKey.deserialize(Buffer.from(bytes));
    return new PrivateKey(secretKey);
  }

  static fromHex(hex: string): PrivateKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static fromKeygen(entropy?: Uint8Array): PrivateKey {
    const sk = generateRandomSecretKey(entropy && Buffer.from(entropy));
    return this.fromBytes(sk);
  }

  getValue(): SecretKeyType {
    return this.value;
  }

  signMessage(message: Uint8Array): Signature {
    return new Signature(this.value.sign(message));
  }

  toPublicKey(): PublicKey {
    return new PublicKey(this.value.getPublicKey());
  }

  toBytes(): Buffer {
    return Buffer.from(this.value.serialize());
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
