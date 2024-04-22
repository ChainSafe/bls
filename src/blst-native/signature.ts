import blst from "@chainsafe/blst";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {SignatureSet, CoordType, PointFormat, Signature as ISignature, PublicKeyArg, SignatureArg} from "../types.js";
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

  static aggregate(signatures: SignatureArg[]): Signature {
    if (signatures.length === 0) {
      throw new EmptyAggregateError();
    }

    const agg = blst.aggregateSignatures(signatures.map(Signature.convertToBlstSignatureArg));
    return new Signature(agg);
  }

  static verifyMultipleSignatures(sets: SignatureSet[]): boolean {
    return blst.verifyMultipleAggregateSignatures(
      sets.map((set) => ({
        message: set.message,
        publicKey: PublicKey.convertToBlstPublicKeyArg(set.publicKey),
        signature: Signature.convertToBlstSignatureArg(set.signature),
      }))
    );
  }

  static asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean> {
    return blst.asyncVerifyMultipleAggregateSignatures(
      sets.map((set) => ({
        message: set.message,
        publicKey: PublicKey.convertToBlstPublicKeyArg(set.publicKey),
        signature: Signature.convertToBlstSignatureArg(set.signature),
      }))
    );
  }

  static convertToBlstSignatureArg(signature: SignatureArg): blst.SignatureArg {
    // Need to cast to blst-native Signature instead of ISignature
    return signature instanceof Uint8Array ? signature : (signature as Signature).value;
  }

  /**
   * Implemented for SecretKey to be able to call .sign()
   */
  private static friendBuild(sig: blst.Signature): Signature {
    return new Signature(sig);
  }

  verify(publicKey: PublicKeyArg, message: Uint8Array): boolean {
    // TODO (@matthewkeil) The note in aggregateVerify and the checks in this method
    // do not seem to go together. Need to check the spec further.

    // Individual infinity signatures are NOT okay. Aggregated signatures MAY be infinity
    if (this.value.isInfinity()) {
      throw new ZeroSignatureError();
    }
    return blst.verify(message, PublicKey.convertToBlstPublicKeyArg(publicKey), this.value);
  }

  verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): boolean {
    return blst.fastAggregateVerify(message, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value);
  }

  verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): boolean {
    return this.aggregateVerify(publicKeys, messages, false);
  }

  async asyncVerify(publicKey: PublicKeyArg, message: Uint8Array): Promise<boolean> {
    // TODO (@matthewkeil) The note in aggregateVerify and the checks in this method
    // do not seem to go together. Need to check the spec further.

    // Individual infinity signatures are NOT okay. Aggregated signatures MAY be infinity
    if (this.value.isInfinity()) {
      throw new ZeroSignatureError();
    }
    return blst.asyncVerify(message, PublicKey.convertToBlstPublicKeyArg(publicKey), this.value);
  }

  async asyncVerifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): Promise<boolean> {
    return blst.asyncFastAggregateVerify(message, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value);
  }

  async asyncVerifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): Promise<boolean> {
    return this.aggregateVerify(publicKeys, messages, true);
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

  private aggregateVerify<T extends false>(publicKeys: PublicKeyArg[], messages: Uint8Array[], runAsync: T): boolean;
  private aggregateVerify<T extends true>(
    publicKeys: PublicKeyArg[],
    messages: Uint8Array[],
    runAsync: T
  ): Promise<boolean>;
  private aggregateVerify<T extends boolean>(
    publicKeys: PublicKeyArg[],
    messages: Uint8Array[],
    runAsync: T
  ): Promise<boolean> | boolean {
    // TODO (@matthewkeil) The note in verify and the checks in this method
    // do not seem to go together. Need to check the spec further.

    // If this set is simply an infinity signature and infinity publicKey then skip verification.
    // This has the effect of always declaring that this sig/publicKey combination is valid.
    // for Eth2.0 specs tests
    if (publicKeys.length === 1) {
      const publicKey = publicKeys[0];
      // eslint-disable-next-line prettier/prettier
      const pk: PublicKey = publicKey instanceof Uint8Array 
        ? PublicKey.fromBytes(publicKey) 
        : (publicKey as PublicKey); // need to cast to blst-native key instead of IPublicKey
      // @ts-expect-error Need to hack type to get access to the private `value`
      if (this.value.isInfinity() && pk.value.isInfinity()) {
        return runAsync ? Promise.resolve(true) : true;
      }
    }

    return runAsync
      ? blst.asyncAggregateVerify(messages, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value)
      : blst.aggregateVerify(messages, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value);
  }
}
