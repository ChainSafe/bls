interface SecretKey {
  toPublicKey(): PublicKey;
  sign(msg: Uint8Array): Signature;
  serialize(): Uint8Array;
}

interface PublicKey {
  keyValidate(): void;
  compress(): Uint8Array;
  serialize(): Uint8Array;
}

interface Signature {
  compress(): Uint8Array;
  serialize(): Uint8Array;
}

interface Bls {
  // Verification
  verify(msg: Uint8Array, pk: PublicKey, sig: Signature): void;
  fastAggregateVerify(msg: Uint8Array, pks: PublicKey[], sig: Signature): void;
  aggregateVerify(msgs: Uint8Array[], pks: PublicKey[], sig: Signature): void;
  aggregateVerifyMultiple(msgs: Uint8Array[], pks: PublicKey[], sigs: Signature[]): void;

  // Aggregation
  aggregatePublicKeys(pks: PublicKey[]): PublicKey;
  aggregateSignatures(sigs: Signature[]): Signature;

  // Deserialization
  publicKeyFromBytes(bytes: Uint8Array): PublicKey;
  signatureFromBytes(bytes: Uint8Array): Signature;
  secretKeyFromBytes(bytes: Uint8Array): SecretKey;
  secretKeyFromKeygen(ikm: Uint8Array): SecretKey;
}
