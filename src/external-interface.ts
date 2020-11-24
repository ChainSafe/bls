export interface IBls {
  PrivateKey: {
    fromKeygen(ikm?: Uint8Array): IPrivateKey;
    fromBytes(bytes: Uint8Array): IPrivateKey;
    fromHex(hex: string): IPrivateKey;
  };
  PublicKey: {
    aggregate(pubkeys: IPublicKey[]): IPublicKey;
    fromBytes(bytes: Uint8Array): IPublicKey;
    fromHex(hex: string): IPublicKey;
  };
  Signature: {
    aggregate(signatures: ISignature[]): ISignature;
    fromBytes(bytes: Uint8Array): ISignature;
    fromHex(hex: string): ISignature;
  };

  sign(secretKey: Uint8Array, messageHash: Uint8Array): Uint8Array;
  aggregatePubkeys(publicKeys: Uint8Array[]): Uint8Array;
  aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
  verify(publicKey: Uint8Array, messageHash: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], messageHash: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messageHashes: Uint8Array[], signature: Uint8Array): boolean;

  init(): Promise<void>;
  destroy(): void;
}

export interface IPublicKey {
  toBytes(): Uint8Array;
  toHex(): string;
}
export interface IPrivateKey {
  toPublicKey(): IPublicKey;
  signMessage(message: Uint8Array): ISignature;
  toBytes(): Uint8Array;
  toHex(): string;
}

export interface ISignature {
  verify(publicKey: IPublicKey, message: Uint8Array): boolean;
  verifyAggregate(publicKeys: IPublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: IPublicKey[], messages: Uint8Array[]): boolean;
  toBytes(): Uint8Array;
  toHex(): string;
}
