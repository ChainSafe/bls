import {SignatureType} from "@chainsafe/eth2-bls-wasm";
import {SIGNATURE_LENGTH, EMPTY_SIGNATURE} from "./constants";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";

export class Signature {
  private value: SignatureType;

  protected constructor(value: SignatureType) {
    this.value = value;
    if (!this.value.isValidOrder()) {
      throw Error("Signature is not in valid order");
    }
  }

  public static fromCompressedBytes(value: Uint8Array): Signature {
    if (value.length !== SIGNATURE_LENGTH) {
      throw Error(`Signature must have ${SIGNATURE_LENGTH} bytes`);
    }

    const context = getContext();
    const signature = new context.Signature();
    if (!EMPTY_SIGNATURE.equals(value)) {
      signature.deserialize(value);
    }
    return new Signature(signature);
  }

  public static fromValue(signature: SignatureType): Signature {
    return new Signature(signature);
  }

  public static aggregate(signatures: Signature[]): Signature {
    const context = getContext();
    const signature = new context.Signature();
    signature.aggregate(signatures.map((sig) => sig.getValue()));
    return new Signature(signature);
  }

  public add(other: Signature): Signature {
    const agg = this.value.clone();
    agg.add(other.value);
    return new Signature(agg);
  }

  public getValue(): SignatureType {
    return this.value;
  }

  public verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return this.value.fastAggregateVerify(
      publicKeys.map((key) => key.getValue()),
      message
    );
  }

  public verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[], fast = false): boolean {
    const msgs = Buffer.concat(messages);
    if (!fast && !getContext().areAllMsgDifferent(msgs)) {
      return false;
    }
    return this.value.aggregateVerifyNoCheck(
      publicKeys.map((key) => key.getValue()),
      msgs
    );
  }

  public toBytesCompressed(): Buffer {
    return Buffer.from(this.value.serialize());
  }

  public toHex(): string {
    return "0x" + this.value.serializeToHexStr();
  }
}
