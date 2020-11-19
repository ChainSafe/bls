import * as blst from "@chainsafe/blst-ts";
import {blst as blstBindings} from "@chainsafe/blst-ts/dist/bindings";
import {bytesToHex, hexToBytes} from "./helpers/utils";
import {PublicKey} from "./publicKey";

export class Signature {
  readonly value: blst.Signature;

  constructor(value: blst.Signature) {
    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): Signature {
    return new Signature(blst.Signature.fromBytes(bytes));
  }

  static fromHex(hex: string): Signature {
    return this.fromBytes(hexToBytes(hex));
  }

  static fromValue(signature: blst.Signature): Signature {
    return new Signature(signature);
  }

  static aggregate(signatures: Signature[]): Signature {
    const agg = blst.AggregateSignature.fromSignatures(signatures.map((sig) => sig.value));
    return new Signature(agg.toSignature());
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return blst.fastAggregateVerify(
      message,
      publicKeys.map((pk) => pk.affine),
      this.value
    );
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    return blst.aggregateVerify(
      messages,
      publicKeys.map((pk) => pk.affine),
      this.value
    );
  }

  toBytes(): Buffer {
    return Buffer.from(this.value.toBytes());
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
