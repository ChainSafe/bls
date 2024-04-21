import type { SignatureType } from "bls-eth-wasm";
import { PublicKey } from "./publicKey.js";
import { SignatureSet, PointFormat, Signature as ISignature, CoordType, PublicKeyArg, SignatureArg } from "../types.js";
export declare class Signature implements ISignature {
    readonly value: SignatureType;
    constructor(value: SignatureType);
    /**
     * @param type Does not affect `herumi` implementation, always de-serializes to `jacobian`
     * @param validate With `herumi` implementation signature validation is always on regardless of this flag.
     */
    static fromBytes(bytes: Uint8Array, _type?: CoordType, _validate?: boolean): Signature;
    static fromHex(hex: string): Signature;
    static aggregate(signatures: SignatureArg[]): Signature;
    static verifyMultipleSignatures(sets: SignatureSet[]): boolean;
    static asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean>;
    static convertToSignatureType(signature: SignatureArg): SignatureType;
    verify(publicKey: PublicKeyArg, message: Uint8Array): boolean;
    verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): boolean;
    verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): boolean;
    asyncVerify(publicKey: PublicKey, message: Uint8Array): Promise<boolean>;
    asyncVerifyAggregate(publicKeys: PublicKey[], message: Uint8Array): Promise<boolean>;
    asyncVerifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): Promise<boolean>;
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
    multiplyBy(_bytes: Uint8Array): Signature;
}
