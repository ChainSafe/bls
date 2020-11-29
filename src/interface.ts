export interface IBls {
  PrivateKey: {
    fromBytes(bytes: Uint8Array): IPrivateKey;
    fromHex(hex: string): IPrivateKey;
    fromKeygen(ikm?: Uint8Array): IPrivateKey;
  };
  PublicKey: {
    fromBytes(bytes: Uint8Array): IPublicKey;
    fromHex(hex: string): IPublicKey;
    aggregate(pubkeys: IPublicKey[]): IPublicKey;
  };
  Signature: {
    fromBytes(bytes: Uint8Array): ISignature;
    fromHex(hex: string): ISignature;
    aggregate(signatures: ISignature[]): ISignature;
  };

  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePubkeys(publicKeys: Uint8Array[]): Uint8Array;
  aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean;

  init(): Promise<void>;
  destroy(): void;
}

export interface IKeypair {
  publicKey: IPublicKey;
  privateKey: IPrivateKey;
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

export interface IPrivateKey {
  toPublicKey(): IPublicKey;
  sign(message: Uint8Array): ISignature;
  toBytes(): Uint8Array;
  toHex(): string;
}
