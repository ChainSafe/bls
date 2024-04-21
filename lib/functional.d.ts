import { IBls, PublicKeyArg, SignatureArg, SignatureSet } from "./types.js";
export declare function functionalInterfaceFactory({ implementation, SecretKey, PublicKey, Signature, }: Pick<IBls, "implementation" | "SecretKey" | "PublicKey" | "Signature">): {
    sign: (secretKey: Uint8Array, message: Uint8Array) => Uint8Array;
    aggregateSignatures: (signatures: SignatureArg[]) => Uint8Array;
    aggregatePublicKeys: (publicKeys: PublicKeyArg[]) => Uint8Array;
    verify: (publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg) => boolean;
    asyncVerify: (publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg) => Promise<boolean>;
    verifyAggregate: (publicKeys: PublicKeyArg[], message: Uint8Array, signature: SignatureArg) => boolean;
    asyncVerifyAggregate: (publicKeys: PublicKeyArg[], message: Uint8Array, signature: SignatureArg) => Promise<boolean>;
    verifyMultiple: (publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg) => boolean;
    asyncVerifyMultiple: (publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg) => Promise<boolean>;
    verifyMultipleSignatures: (sets: SignatureSet[]) => boolean;
    asyncVerifyMultipleSignatures: (sets: SignatureSet[]) => Promise<boolean>;
    secretKeyToPublicKey: (secretKey: Uint8Array) => Uint8Array;
};
