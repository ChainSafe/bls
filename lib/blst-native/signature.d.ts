import blst from "@chainsafe/blst";
import { SignatureSet, CoordType, PointFormat, Signature as ISignature, PublicKeyArg, SignatureArg } from "../types.js";
export declare class Signature implements ISignature {
    private readonly value;
    private constructor();
    /** @param type Defaults to `CoordType.affine` */
    static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): Signature;
    static fromHex(hex: string): Signature;
    static aggregate(signatures: SignatureArg[]): Signature;
    static verifyMultipleSignatures(sets: SignatureSet[]): boolean;
    static asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean>;
    static convertToBlstSignatureArg(signature: SignatureArg): blst.SignatureArg;
    /**
     * Implemented for SecretKey to be able to call .sign()
     */
    private static friendBuild;
    verify(publicKey: PublicKeyArg, message: Uint8Array): boolean;
    verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): boolean;
    verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): boolean;
    asyncVerify(publicKey: PublicKeyArg, message: Uint8Array): Promise<boolean>;
    asyncVerifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): Promise<boolean>;
    asyncVerifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): Promise<boolean>;
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
    multiplyBy(bytes: Uint8Array): Signature;
    private aggregateVerify;
}
