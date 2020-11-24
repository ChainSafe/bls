interface IBls {
  Keypair: {
    generate(): Keypair;
  };
  PrivateKey: {
    fromBytes(bytes: Uint8Array): PrivateKey;
    fromHexString(value: string): PrivateKey;
    fromInt(num: number): PrivateKey;
    random(): PrivateKey;
  };
  PublicKey: {
    fromPrivateKey(privateKey: PrivateKey): PublicKey;
    fromBytes(bytes: Uint8Array): PublicKey;
    fromHex(value: string): PublicKey;
    fromPublicKeyType(value: IPublicKeyValue): PublicKey;
  };
  Signature: {
    fromCompressedBytes(value: Uint8Array): Signature;
    fromValue(signature: ISignatureValue): Signature;
    aggregate(signatures: Signature[]): Signature;
  };

  initBLS(): Promise<void>;
  generateKeyPair(): Keypair;
  generatePublicKey(secretKey: Uint8Array): Buffer;
  sign(secretKey: Uint8Array, messageHash: Uint8Array): Buffer;
  aggregateSignatures(signatures: Uint8Array[]): Buffer;
  aggregatePubkeys(publicKeys: Uint8Array[]): Buffer;
  verify(publicKey: Uint8Array, messageHash: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], messageHash: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messageHashes: Uint8Array[], signature: Uint8Array, fast = false): boolean;
}

interface Keypair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

interface PrivateKey {
  getValue(): IPrivateKeyValue;
  signMessage(message: Uint8Array): Signature;
  toPublicKey(): PublicKey;
  toBytes(): Buffer;
  toHexString(): string;
}

interface PublicKey {
  add(other: PublicKey): PublicKey;
  verifyMessage(signature: Signature, messageHash: Uint8Array): boolean;
  toBytesCompressed(): Buffer;
  toHexString(): string;
  getValue(): IPublicKeyValue;
}

interface Signature {
  add(other: Signature): Signature;
  getValue(): ISignatureValue;
  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[], fast = false): boolean;
  toBytesCompressed(): Buffer;
  toHex(): string;
}
