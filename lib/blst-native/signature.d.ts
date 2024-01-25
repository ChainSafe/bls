import * as blst from "../../temp-deps/blst-ts/lib/index.js";
import { PointFormat, Signature as ISignature } from "../types.js";
import { PublicKey } from "./publicKey.js";
export declare class Signature implements ISignature {
    private readonly sig;
    constructor(sig: blst.Signature);
    /** @param type Defaults to `CoordType.affine` */
    static fromBytes(bytes: Uint8Array, type?: blst.CoordType, validate?: boolean): Signature;
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
    private aggregateVerify;
}
