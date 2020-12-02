import {SIGNATURE_LENGTH} from "../constants";
import {SignatureType, multiVerify} from "bls-eth-wasm";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";
import {bytesToHex, hexToBytes, isZeroUint8Array} from "../helpers";
import {Signature as ISignature} from "../interface";
import {EmptyAggregateError, InvalidLengthError, InvalidOrderError} from "../errors";

export class Signature implements ISignature {
  readonly value: SignatureType;

  constructor(value: SignatureType) {
    if (!value.isValidOrder()) {
      throw new InvalidOrderError();
    }

    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): Signature {
    if (bytes.length !== SIGNATURE_LENGTH) {
      throw new InvalidLengthError("Signature", SIGNATURE_LENGTH);
    }

    const context = getContext();
    const signature = new context.Signature();
    if (!isZeroUint8Array(bytes)) {
      signature.deserialize(bytes);
    }
    return new Signature(signature);
  }

  static fromHex(hex: string): Signature {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(signatures: Signature[]): Signature {
    if (signatures.length === 0) {
      throw new EmptyAggregateError();
    }

    const context = getContext();
    const signature = new context.Signature();
    signature.aggregate(signatures.map((sig) => sig.value));
    return new Signature(signature);
  }

  static verifyMultipleSignatures(publicKeys: PublicKey[], messages: Uint8Array[], signatures: Signature[]): boolean {
    return multiVerify(
      publicKeys.map((publicKey) => publicKey.value),
      signatures.map((signature) => signature.value),
      messages
    );
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

  toBytes(): Uint8Array {
    return this.value.serialize();
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
