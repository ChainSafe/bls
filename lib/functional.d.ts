import { IBls, PublicKeyArg, SignatureArg } from "./types.js";
export declare function functionalInterfaceFactory({ implementation, SecretKey, PublicKey, Signature, }: Pick<IBls, "implementation" | "SecretKey" | "PublicKey" | "Signature">): {
    sign: (secretKey: Uint8Array, message: Uint8Array) => Uint8Array;
    aggregateSignatures: (signatures: Uint8Array[]) => Uint8Array;
    aggregatePublicKeys: (publicKeys: Uint8Array[]) => Uint8Array;
    verify: (publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array) => boolean;
    verifyAggregate: (publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array) => boolean;
    verifyMultiple: (publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array) => boolean;
    verifyMultipleSignatures: (sets: {
        publicKey: Uint8Array;
        message: Uint8Array;
        signature: Uint8Array;
    }[]) => boolean;
    asyncVerify: (message: Uint8Array, publicKey: PublicKeyArg, signature: SignatureArg) => Promise<boolean>;
    asyncVerifyAggregate: (message: Uint8Array, publicKeys: PublicKeyArg[], signature: SignatureArg) => Promise<boolean>;
    asyncVerifyMultiple: (messages: Uint8Array[], publicKeys: PublicKeyArg[], signature: SignatureArg) => Promise<boolean>;
    asyncVerifyMultipleSignatures: (sets: {
        message: Uint8Array;
        publicKey: PublicKeyArg;
        signature: SignatureArg;
    }[]) => Promise<boolean>;
    secretKeyToPublicKey: (secretKey: Uint8Array) => Uint8Array;
};
