export interface IBls {
  PrivateKey: {
    fromBytes(bytes: Uint8Array): IPrivateKey;
    fromHex(hex: string): IPrivateKey;
    fromKeygen(): IPrivateKey;
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

  sign(secretKey: Uint8Array, messageHash: Uint8Array): Buffer;
  aggregatePubkeys(publicKeys: Uint8Array[]): Buffer;
  aggregateSignatures(signatures: Uint8Array[]): Buffer;
  verify(publicKey: Uint8Array, messageHash: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], messageHash: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messageHashes: Uint8Array[], signature: Uint8Array): boolean;

  initBLS(): Promise<void>;
  destroy(): void;
}

export interface IKeypair {
  publicKey: IPublicKey;
  privateKey: IPrivateKey;
}

export interface IPublicKey {
  toBytes(): Buffer;
  toHex(): string;
}

export interface ISignature {
  toBytes(): Buffer;
  toHex(): string;
  verify(publicKey: IPublicKey, message: Uint8Array): boolean;
  verifyAggregate(publicKeys: IPublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: IPublicKey[], messages: Uint8Array[]): boolean;
}

export interface IPrivateKey {
  toPublicKey(): IPublicKey;
  signMessage(message: Uint8Array): ISignature;
  toBytes(): Buffer;
  toHex(): string;
}
