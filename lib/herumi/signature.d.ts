import type { SignatureType } from "bls-eth-wasm";
import { PublicKey } from "./publicKey.js";
import { PointFormat, Signature as ISignature, CoordType } from "../types.js";
export declare class Signature implements ISignature {
    readonly value: SignatureType;
    constructor(value: SignatureType);
    /**
     * @param type Does not affect `herumi` implementation, always de-serializes to `jacobian`
     * @param validate With `herumi` implementation signature validation is always on regardless of this flag.
     */
    static fromBytes(bytes: Uint8Array, _type?: CoordType, _validate?: boolean): Signature;
    static fromHex(hex: string): Signature;
    static aggregate(signatures: Signature[]): Signature;
    static verifyMultipleSignatures(sets: {
        publicKey: PublicKey;
        message: Uint8Array;
        signature: Signature;
    }[]): boolean;
    verify(publicKey: PublicKey, message: Uint8Array): boolean;
    verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
    verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean;
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
}
