import {SIGNATURE_LENGTH, EMPTY_SIGNATURE} from "../constants";
import {SignatureType} from "bls-eth-wasm";
import {getContext} from "./context";
import {PublicKey} from "./publicKey";
import {bytesToHex, hexToBytes, isEqualBytes} from "../helpers";
import {ISignature} from "../interface";

export class Signature implements ISignature {
  readonly value: SignatureType;

  constructor(value: SignatureType) {
    if (!value.isValidOrder()) {
      throw Error("Signature is not in valid order");
    }

    this.value = value;
  }

  static fromBytes(bytes: Uint8Array): Signature {
    if (bytes.length !== SIGNATURE_LENGTH) {
      throw Error(`Signature must have ${SIGNATURE_LENGTH} bytes`);
    }

    const context = getContext();
    const signature = new context.Signature();
    if (!isEqualBytes(EMPTY_SIGNATURE, bytes)) {
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
