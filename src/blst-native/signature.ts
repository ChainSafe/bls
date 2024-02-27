/* eslint-disable @typescript-eslint/no-explicit-any */
import * as blst from "../../temp-deps/blst-ts/lib/index.js";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {PointFormat, Signature as ISignature} from "../types.js";
import {PublicKey} from "./publicKey.js";
import {EmptyAggregateError, ZeroSignatureError} from "../errors.js";

export class Signature implements ISignature {
  private constructor(private readonly sig: blst.Signature) {}

  /** @param type Defaults to `CoordType.affine` */
  static fromBytes(bytes: Uint8Array, type?: blst.CoordType, validate = true): Signature {
    const sig = blst.Signature.deserialize(bytes, type);
    if (validate) sig.sigValidate();
    return new Signature(sig);
  }

  static fromHex(hex: string): Signature {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(signatures: Signature[]): Signature {
    if (signatures.length === 0) {
      throw new EmptyAggregateError();
    }

    const agg = blst.aggregateSignatures(signatures.map(({sig}) => sig));
    return new Signature(agg);
  }

  static verifyMultipleSignatures(sets: {publicKey: PublicKey; message: Uint8Array; signature: Signature}[]): boolean {
    return blst.verifyMultipleAggregateSignatures(
      sets.map((s) => ({message: s.message, publicKey: (s.publicKey as any).key, signature: s.signature.sig}))
    );
  }

  /**
   * Implemented for SecretKey to be able to call .sign()
   */
  private static friendBuild(sig: blst.Signature): Signature {
    return new Signature(sig);
  }

  verify(publicKey: PublicKey, message: Uint8Array): boolean {
    // Individual infinity signatures are NOT okay. Aggregated signatures MAY be infinity
    if (this.sig.isInfinity()) {
      throw new ZeroSignatureError();
    }
    return blst.verify(message, (publicKey as any).key, this.sig);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return blst.fastAggregateVerify(
      message,
      publicKeys.map((pk) => (pk as any).key),
      this.sig
    );
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    return blst.aggregateVerify(
      messages,
      publicKeys.map((pk) => (pk as any).key),
      this.sig
    );
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.sig.serialize(false);
    } else {
      return this.sig.serialize(true);
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }

  multiplyBy(bytes: Uint8Array): Signature {
    return new Signature(this.sig.multiplyBy(bytes));
  }

  private aggregateVerify(msgs: Uint8Array[], pks: blst.PublicKey[]): boolean {
    // If this set is simply an infinity signature and infinity publicKey then skip verification.
    // This has the effect of always declaring that this sig/publicKey combination is valid.
    // for Eth2.0 specs tests
    if (this.sig.isInfinity() && pks.length === 1 && pks[0].isInfinity()) {
      return true;
    }

    return blst.aggregateVerify(msgs, pks, this.sig);
  }
}
