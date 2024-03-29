import { PointFormat, Signature as ISignature, CoordType } from "../types.js";
import { PublicKey } from "./publicKey.js";
export declare class Signature implements ISignature {
    private readonly sig;
    private constructor();
    /** @param type Defaults to `CoordType.affine` */
    static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): Signature;
    static fromHex(hex: string): Signature;
    static aggregate(signatures: Signature[]): Signature;
    static verifyMultipleSignatures(sets: {
        publicKey: PublicKey;
        message: Uint8Array;
        signature: Signature;
    }[]): boolean;
    /**
     * Implemented for SecretKey to be able to call .sign()
     */
    private static friendBuild;
    verify(publicKey: PublicKey, message: Uint8Array): boolean;
    verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
    verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean;
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
    multiplyBy(bytes: Uint8Array): Signature;
    private aggregateVerify;
}
