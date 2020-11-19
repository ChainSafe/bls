import * as blst from "@chainsafe/blst";
import {bytesToHex, hexToBytes} from "../helpers/utils";
import {PublicKey} from "./publicKey";

export class Signature {
  readonly affine: blst.Signature;

  constructor(value: blst.Signature) {
    this.affine = value;
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
    const agg = blst.AggregateSignature.fromSignatures(signatures.map((sig) => sig.affine));
    return new Signature(agg.toSignature());
  }

  verify(publicKey: PublicKey, message: Uint8Array): boolean {
    return this.aggregateVerify([message], [publicKey.affine]);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    const agg = PublicKey.aggregate(publicKeys);
    return this.aggregateVerify([message], [agg.affine]);
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    return this.aggregateVerify(
      messages,
      publicKeys.map((pk) => pk.affine)
    );
  }

  private aggregateVerify(msgs: Uint8Array[], pks: blst.PublicKey[]): boolean {
    // If this set is simply an infinity signature and infinity pubkey then skip verification.
    // This has the effect of always declaring that this sig/pubkey combination is valid.
    // for Eth2.0 specs tests
    if (this.affine.value.is_inf() && pks.length === 1 && pks[0].value.is_inf()) {
      return true;
    }

    return blst.aggregateVerify(msgs, pks, this.affine);
  }

  toBytes(): Buffer {
    return Buffer.from(this.affine.toBytes());
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
