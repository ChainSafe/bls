import * as blst from "@chainsafe/blst";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {PointFormat, Signature as ISignature} from "../interface.js";
import {PublicKey} from "./publicKey.js";
import {EmptyAggregateError, ZeroSignatureError} from "../errors.js";

export class Signature extends blst.Signature implements ISignature {
  constructor(value: ConstructorParameters<typeof blst.Signature>[0]) {
    super(value);
  }

  /** @param type Defaults to `CoordType.affine` */
  static fromBytes(bytes: Uint8Array, type?: blst.CoordType, validate = true): Signature {
    const sig = blst.Signature.fromBytes(bytes, type);
    if (validate) sig.sigValidate();
    return new Signature(sig.value);
  }

  static fromHex(hex: string): Signature {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(signatures: Signature[]): Signature {
    if (signatures.length === 0) {
      throw new EmptyAggregateError();
    }

    const agg = blst.aggregateSignatures(signatures);
    return new Signature(agg.value);
  }

  static verifyMultipleSignatures(sets: {publicKey: PublicKey; message: Uint8Array; signature: Signature}[]): boolean {
    return blst.verifyMultipleAggregateSignatures(
      sets.map((s) => ({msg: s.message, pk: s.publicKey, sig: s.signature}))
    );
  }

  verify(publicKey: PublicKey, message: Uint8Array): boolean {
    // Individual infinity signatures are NOT okay. Aggregated signatures MAY be infinity
    if (this.value.is_inf()) {
      throw new ZeroSignatureError();
    }

    return blst.verify(message, publicKey, this);
  }

  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean {
    return blst.fastAggregateVerify(message, publicKeys, this);
  }

  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean {
    return blst.aggregateVerify(messages, publicKeys, this);
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.value.serialize();
    } else {
      return this.value.compress();
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }

  private aggregateVerify(msgs: Uint8Array[], pks: blst.PublicKey[]): boolean {
    // If this set is simply an infinity signature and infinity publicKey then skip verification.
    // This has the effect of always declaring that this sig/publicKey combination is valid.
    // for Eth2.0 specs tests
    if (this.value.is_inf() && pks.length === 1 && pks[0].value.is_inf()) {
      return true;
    }

    return blst.aggregateVerify(msgs, pks, this);
  }
}
