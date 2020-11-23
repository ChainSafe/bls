import {PrivateKey} from "./privateKey";
import {PUBLIC_KEY_LENGTH} from "./constants";
import assert from "assert";
import {Signature} from "./signature";
import {EMPTY_PUBLIC_KEY} from "./helpers/utils";
import {IPublicKeyValue} from "./interface";
import {getContext} from "./context";

export class PublicKey {
  private value: IPublicKeyValue;

  protected constructor(value: IPublicKeyValue) {
    this.value = value;
  }

  public static fromPrivateKey(privateKey: PrivateKey): PublicKey {
    return privateKey.toPublicKey();
  }

  public static fromBytes(bytes: Uint8Array): PublicKey {
    const context = getContext();
    const publicKey = new context.PublicKey();
    if (!EMPTY_PUBLIC_KEY.equals(bytes)) {
      publicKey.deserialize(bytes);
    }
    return new PublicKey(publicKey);
  }

  public static fromHex(value: string): PublicKey {
    value = value.replace("0x", "");
    assert(value.length === PUBLIC_KEY_LENGTH * 2);
    const context = getContext();
    const pubkeyValue = new context.PublicKey();
    pubkeyValue.deserializeHexStr(value);
    return new PublicKey(pubkeyValue);
  }

  public static fromPublicKeyType(value: IPublicKeyValue): PublicKey {
    return new PublicKey(value);
  }

  public add(other: PublicKey): PublicKey {
    const agg = new PublicKey(this.value.clone());
    agg.value.add(other.value);
    return agg;
  }

  public verifyMessage(signature: Signature, messageHash: Uint8Array): boolean {
    return this.value.verify(signature.getValue(), messageHash);
  }

  public toBytesCompressed(): Buffer {
    return Buffer.from(this.value.serialize());
  }

  public toHexString(): string {
    return `0x${this.toBytesCompressed().toString("hex")}`;
  }

  public getValue(): IPublicKeyValue {
    return this.value;
  }
}
