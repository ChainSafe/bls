import { CoordType } from "../temp-deps/blst-ts/lib/index.js";
export declare type PublicKeyArg = PublicKey | Uint8Array;
export declare type SignatureArg = Signature | Uint8Array;
export interface IBls {
    implementation: Implementation;
    SecretKey: typeof SecretKey;
    PublicKey: typeof PublicKey;
    Signature: typeof Signature;
    sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
    aggregatePublicKeys(publicKeys: Uint8Array[]): Uint8Array;
    aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
    verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
    verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean;
    verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean;
    verifyMultipleSignatures(sets: {
        publicKey: Uint8Array;
        message: Uint8Array;
        signature: Uint8Array;
    }[]): boolean;
    asyncVerify(message: Uint8Array, publicKey: PublicKeyArg, signature: SignatureArg): Promise<boolean>;
    asyncVerifyAggregate(message: Uint8Array, publicKeys: PublicKeyArg[], signature: SignatureArg): Promise<boolean>;
    asyncVerifyMultiple(messages: Uint8Array[], publicKeys: PublicKeyArg[], signature: SignatureArg): Promise<boolean>;
    asyncVerifyMultipleSignatures(sets: {
        message: Uint8Array;
        publicKey: PublicKeyArg;
        signature: SignatureArg;
    }[]): Promise<boolean>;
    secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array;
}
export declare class SecretKey {
    private constructor();
    static fromBytes(bytes: Uint8Array): SecretKey;
    static fromHex(hex: string): SecretKey;
    static fromKeygen(entropy?: Uint8Array): SecretKey;
    sign(message: Uint8Array): Signature;
    toPublicKey(): PublicKey;
    toBytes(): Uint8Array;
    toHex(): string;
}
export declare class PublicKey {
    private constructor();
    /** @param type Only for impl `blst-native`. Defaults to `CoordType.jacobian` */
    static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): PublicKey;
    static fromHex(hex: string): PublicKey;
    static aggregate(publicKeys: PublicKey[]): PublicKey;
    /** @param format Defaults to `PointFormat.compressed` */
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
    multiplyBy(bytes: Uint8Array): PublicKey;
}
export declare class Signature {
    private constructor();
    /** @param type Only for impl `blst-native`. Defaults to `CoordType.affine`
     *  @param validate When using `herumi` implementation, signature validation is always on regardless of this flag. */
    static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): Signature;
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
    /** @param format Defaults to `PointFormat.compressed` */
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
    multiplyBy(bytes: Uint8Array): Signature;
}
export declare type Implementation = "herumi" | "blst-native";
export declare enum PointFormat {
    compressed = "compressed",
    uncompressed = "uncompressed"
}
export interface SignatureSet {
    message: Uint8Array;
    publicKey: PublicKey;
    signature: Signature;
}
export { CoordType };
