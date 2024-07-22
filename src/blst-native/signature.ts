import blst from "@chainsafe/blst";
import {SignatureSet, Signature as ISignature} from "../types.js";
import {PublicKey} from "./publicKey.js";
import {EmptyAggregateError} from "../errors.js";

export class Signature implements ISignature {
  constructor(private readonly value: blst.Signature) {}

  static fromBytes(bytes: Uint8Array, validate = true): Signature {
    return new Signature(blst.Signature.fromBytes(bytes, validate, false));
  }

  static fromHex(hex: string, validate = true): Signature {
    return new Signature(blst.Signature.fromHex(hex, validate, false));
  }

  static aggregate(signatures: Signature[]): Signature {
    if (signatures.length === 0) {
      throw new EmptyAggregateError();
    }

    const agg = blst.aggregateSignatures(signatures.map((sig) => sig.value));
    return new Signature(agg);
  }

  static verifyMultipleSignatures(sets: SignatureSet[]): boolean {
    return blst.verifyMultipleAggregateSignatures(
      sets.map((set) => ({
        msg: set.message,
        pk: (set.publicKey as PublicKey)["value"],
        sig: (set.signature as Signature)["value"],
      })),
      true,
      true
    );
  }

  verify(publicKey: PublicKey, message: Uint8Array): boolean {
    return blst.verify(message, publicKey["value"], this.value);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return blst.fastAggregateVerify(
      message,
      publicKeys.map((pk) => pk["value"]),
      this.value
    );
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    return blst.aggregateVerify(
      messages,
      publicKeys.map((pk) => pk["value"]),
      this.value
    );
  }

  toBytes(compress = true): Uint8Array {
    return this.value.toBytes(compress);
  }

  toHex(compress = true): string {
    return this.value.toHex(compress);
  }
}
