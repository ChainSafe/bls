export interface IBls {
  SecretKey: {
    fromBytes(bytes: Uint8Array): ISecretKey;
    fromHex(hex: string): ISecretKey;
    fromKeygen(ikm?: Uint8Array): ISecretKey;
  };
  PublicKey: {
    fromBytes(bytes: Uint8Array): IPublicKey;
    fromHex(hex: string): IPublicKey;
    aggregate(publicKeys: IPublicKey[]): IPublicKey;
  };
  Signature: {
    fromBytes(bytes: Uint8Array): ISignature;
    fromHex(hex: string): ISignature;
    aggregate(signatures: ISignature[]): ISignature;
  };

  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePublicKeys(publicKeys: Uint8Array[]): Uint8Array;
  aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean;

  init(): Promise<void>;
  destroy(): void;
}

export interface IKeypair {
  publicKey: IPublicKey;
  secretKey: ISecretKey;
}

export interface IPublicKey {
  toBytes(): Uint8Array;
  toHex(): string;
}

export interface ISignature {
  toBytes(): Uint8Array;
  toHex(): string;
  verify(publicKey: IPublicKey, message: Uint8Array): boolean;
  verifyAggregate(publicKeys: IPublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: IPublicKey[], messages: Uint8Array[]): boolean;
}

export interface ISecretKey {
  toPublicKey(): IPublicKey;
  sign(message: Uint8Array): ISignature;
  toBytes(): Uint8Array;
  toHex(): string;
}
