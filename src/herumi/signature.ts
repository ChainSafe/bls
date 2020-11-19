import assert from "assert";
import {SIGNATURE_LENGTH, EMPTY_SIGNATURE} from "../constants";
import {SignatureType} from "@chainsafe/eth2-bls-wasm";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";
import {bytesToHex, hexToBytes} from "../helpers/utils";

export class Signature {
  readonly value: SignatureType;

  constructor(value: SignatureType) {
    this.value = value;
    assert(this.value.isValidOrder());
  }

  static fromBytes(bytes: Uint8Array): Signature {
    assert(bytes.length === SIGNATURE_LENGTH, `Signature must have ${SIGNATURE_LENGTH} bytes`);
    const context = getContext();
    const signature = new context.Signature();
    if (!EMPTY_SIGNATURE.equals(bytes)) {
      signature.deserialize(bytes);
    }
    return new Signature(signature);
  }

  static fromHex(hex: string): Signature {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(signatures: Signature[]): Signature {
    if (signatures.length === 0) {
      throw Error("EMPTY_AGGREGATE_ARRAY");
    }

    const context = getContext();
    const signature = new context.Signature();
    signature.aggregate(signatures.map((sig) => sig.value));
    return new Signature(signature);
  }

  add(other: Signature): Signature {
    const agg = this.value.clone();
    agg.add(other.value);
    return new Signature(agg);
  }

  verify(publicKey: PublicKey, message: Uint8Array): boolean {
    return publicKey.value.verify(this.value, message);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return this.value.fastAggregateVerify(
      publicKeys.map((key) => key.value),
      message
    );
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    const msgs = Buffer.concat(messages);
    return this.value.aggregateVerifyNoCheck(
      publicKeys.map((key) => key.value),
      msgs
    );
  }

  toBytes(): Buffer {
    return Buffer.from(this.value.serialize());
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
