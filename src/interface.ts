export interface IBls {
  SecretKey: {
    fromBytes(bytes: Uint8Array): SecretKey;
    fromHex(hex: string): SecretKey;
    fromKeygen(ikm?: Uint8Array): SecretKey;
  };
  PublicKey: {
    fromBytes(bytes: Uint8Array): PublicKey;
    fromHex(hex: string): PublicKey;
    aggregate(publicKeys: PublicKey[]): PublicKey;
  };
  Signature: {
    fromBytes(bytes: Uint8Array): Signature;
    fromHex(hex: string): Signature;
    aggregate(signatures: Signature[]): Signature;
  };

  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePublicKeys(publicKeys: Uint8Array[]): Uint8Array;
  aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean;
  secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array;

  init(): Promise<void>;
  destroy(): void;
}

export declare class SecretKey {
  static fromBytes(bytes: Uint8Array): SecretKey;
  static fromHex(hex: string): SecretKey;
  static fromKeygen(entropy?: Uint8Array): SecretKey;
  sign(message: Uint8Array): Signature;
  toPublicKey(): PublicKey;
  toBytes(): Uint8Array;
  toHex(): string;
}

export declare class PublicKey {
  static fromBytes(bytes: Uint8Array): PublicKey;
  static fromHex(hex: string): PublicKey;
  static aggregate(publicKeys: PublicKey[]): PublicKey;
  toBytes(): Uint8Array;
  toHex(): string;
}

export declare class Signature {
  static fromBytes(bytes: Uint8Array): Signature;
  static fromHex(hex: string): Signature;
  static aggregate(signatures: Signature[]): Signature;
  verify(publicKey: PublicKey, message: Uint8Array): boolean;
  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean;
  toBytes(): Uint8Array;
  toHex(): string;
}

export interface IKeypair {
  publicKey: PublicKey;
  secretKey: SecretKey;
}
