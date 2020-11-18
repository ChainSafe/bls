import {SecretKeyType} from "@chainsafe/eth2-bls-wasm";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import {SECRET_KEY_LENGTH} from "./constants";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";

export class PrivateKey {
  private value: SecretKeyType;

  protected constructor(value: SecretKeyType) {
    this.value = value;
  }

  public static fromBytes(bytes: Uint8Array): PrivateKey {
    if (bytes.length !== SECRET_KEY_LENGTH) {
      throw Error(`Private key should have ${SECRET_KEY_LENGTH} bytes`);
    }

    const context = getContext();
    const secretKey = new context.SecretKey();
    secretKey.deserialize(Buffer.from(bytes));
    return new PrivateKey(secretKey);
  }

  public static fromHexString(value: string): PrivateKey {
    value = value.replace("0x", "");

    if (value.length !== SECRET_KEY_LENGTH * 2) {
      throw Error(`Private key must have ${SECRET_KEY_LENGTH} bytes`);
    }

    const context = getContext();
    return new PrivateKey(context.deserializeHexStrToSecretKey(value));
  }

  public static fromInt(num: number): PrivateKey {
    const context = getContext();
    const secretKey = new context.SecretKey();
    secretKey.setInt(num);
    return new PrivateKey(secretKey);
  }

  public static random(): PrivateKey {
    const randomKey: Buffer = generateRandomSecretKey();
    return this.fromBytes(randomKey);
  }

  public getValue(): SecretKeyType {
    return this.value;
  }

  // public sign(message: Uint8Array): Signature {
  //   return Signature.fromValue(this.value.sign(message));
  // }

  public signMessage(message: Uint8Array): Signature {
    return Signature.fromValue(this.value.sign(message));
  }

  public toPublicKey(): PublicKey {
    return PublicKey.fromPublicKeyType(this.value.getPublicKey());
  }

  public toBytes(): Buffer {
    return Buffer.from(this.value.serialize());
  }

  public toHexString(): string {
    return `0x${this.value.serializeToHexStr()}`;
  }
}
