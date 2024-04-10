import blst from "@chainsafe/blst";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {CoordType, PointFormat, Signature as ISignature} from "../types.js";
import {PublicKey} from "./publicKey.js";
import {EmptyAggregateError, ZeroSignatureError} from "../errors.js";

export class Signature implements ISignature {
  private constructor(private readonly value: blst.Signature) {}

  /** @param type Defaults to `CoordType.affine` */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate = true): Signature {
    // need to hack the CoordType so @chainsafe/blst is not a required dep
    const sig = blst.Signature.deserialize(bytes, (type as unknown) as blst.CoordType);
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

    const agg = blst.aggregateSignatures(signatures.map(({value}) => value));
    return new Signature(agg);
  }

  static verifyMultipleSignatures(sets: {publicKey: PublicKey; message: Uint8Array; signature: Signature}[]): boolean {
    return blst.verifyMultipleAggregateSignatures(
      // @ts-expect-error Need to hack type to get access to the private `value`
      sets.map((s) => ({message: s.message, publicKey: s.publicKey.value, signature: s.signature.value}))
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
    if (this.value.isInfinity()) {
      throw new ZeroSignatureError();
    }

    // @ts-expect-error Need to hack type to get access to the private `value`
    return blst.verify(message, publicKey.value, this.value);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return blst.fastAggregateVerify(
      message,
      // @ts-expect-error Need to hack type to get access to the private `value`
      publicKeys.map((pk) => pk.value),
      this.value
    );
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    return this.aggregateVerify(
      messages,
      // @ts-expect-error Need to hack type to get access to the private `value`
      publicKeys.map((pk) => pk.value)
    );
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.value.serialize(false);
    } else {
      return this.value.serialize(true);
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }

  multiplyBy(bytes: Uint8Array): Signature {
    return new Signature(this.value.multiplyBy(bytes));
  }

  private aggregateVerify(msgs: Uint8Array[], pks: blst.PublicKey[]): boolean {
    // If this set is simply an infinity signature and infinity publicKey then skip verification.
    // This has the effect of always declaring that this sig/publicKey combination is valid.
    // for Eth2.0 specs tests
    if (this.value.isInfinity() && pks.length === 1 && pks[0].isInfinity()) {
      return true;
    }

    return blst.aggregateVerify(msgs, pks, this.value);
  }
}
