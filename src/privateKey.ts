import {SECRET_KEY_LENGTH} from "./constants";
import assert from "assert";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import { IPrivateKeyValue } from "./interface";
import { getContext } from "./context";
import { PublicKey, Signature } from ".";

export class PrivateKey {
  private value: IPrivateKeyValue;

  protected constructor(value: IPrivateKeyValue) {
    this.value = value;
  }

  public static fromBytes(bytes: Uint8Array): PrivateKey {
    assert(bytes.length === SECRET_KEY_LENGTH, "Private key should have 32 bytes");
    const context = getContext();
    const secretKey = new context.SecretKey();
    secretKey.deserialize(Buffer.from(bytes));
    return new PrivateKey(secretKey);
  }

  public static fromHexString(value: string): PrivateKey {
    value = value.replace("0x", "");
    assert(value.length === SECRET_KEY_LENGTH * 2, "secret key must have 32 bytes");
    const context = getContext();
    const secretKeyValue = new context.SecretKey();
    secretKeyValue.deserializeHexStr(value);
    return new PrivateKey(secretKeyValue);
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

  public getValue(): IPrivateKeyValue {
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
