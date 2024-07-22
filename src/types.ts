export type Implementation = "herumi" | "blst-native";

export interface SerializedSignatureSet {
  message: Uint8Array;
  publicKey: PublicKey;
  signature: Signature;
}

export interface SignatureSet {
  message: Uint8Array;
  publicKey: PublicKey;
  signature: Signature;
}

export interface IBls {
  implementation: Implementation;
  SecretKey: typeof SecretKey;
  PublicKey: typeof PublicKey;
  Signature: typeof Signature;

  secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array;
  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePublicKeys(publicKeys: Uint8Array[]): Uint8Array;
  aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
  /**
   * Will synchronously verify a signature. This function catches invalid input and return false for
   * bad keys or signatures. Use the `Signature.verify` method if throwing is desired.
   */
  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
  /**
   * Will synchronously verify a signature over a message by multiple aggregated keys. This function
   * catches invalid input and return false for bad keys or signatures. Use the
   * `Signature.verifyAggregate` if throwing is desired.
   */
  verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean;
  /**
   * Will synchronously verify an aggregated signature over a number of messages each signed by a
   * different key. This function catches invalid input and return false for bad keys or signatures.
   * Use the `Signature.verifyAggregate` if throwing is desired.
   *
   * Note: the number of keys and messages must match.
   */
  verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean;
  /**
   * Will synchronously verify a group of SignatureSets where each contains a signature signed for
   * a message by a public key. This function catches invalid input and return false for bad keys or
   * signatures. Use the `Signature.verifyMultipleSignatures` if throwing is desired.
   */
  verifyMultipleSignatures(sets: SignatureSet[]): boolean;
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
  static fromBytes(bytes: Uint8Array, validate?: boolean): PublicKey;
  static fromHex(hex: string, validate?: boolean): PublicKey;
  static aggregate(publicKeys: PublicKey[]): PublicKey;
  /** @param compressed Defaults to `true` */
  toBytes(compressed?: boolean): Uint8Array;
  /** @param compressed Defaults to `true` */
  toHex(compressed?: boolean): string;
}

export declare class Signature {
  /**  @param validate When using `herumi` implementation, signature validation is always on regardless of this flag. */
  static fromBytes(bytes: Uint8Array, validate?: boolean): Signature;
  /**  @param validate When using `herumi` implementation, signature validation is always on regardless of this flag. */
  static fromHex(hex: string, validate?: boolean): Signature;
  static aggregate(signatures: Signature[]): Signature;
  /**
   * Will synchronously verify a group of SignatureSets where each contains a signature signed for
   * a message by a public key. This version of the function will potentially throw errors for
   * invalid input. Use the free function `verifyMultipleSignatures` if throwing is not desired.
   */
  static verifyMultipleSignatures(sets: SignatureSet[]): boolean;
  /**
   * Will synchronously verify a signature. This version of the function will potentially throw
   * errors for invalid input. Use the free function `verify` if throwing is not desired.
   */
  verify(publicKey: PublicKey, message: Uint8Array): boolean;
  /**
   * Will synchronously verify a signature over a message by multiple aggregated keys.  This
   * version of the function will potentially throw errors for invalid input. Use the free function
   * `verifyAggregate` if throwing is not desired.
   */
  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
  /**
   * Will synchronously verify an aggregated signature over a number of messages each signed by a
   * different key. This version of the function will potentially throw errors for invalid input.
   * Use the free function `verifyMultiple` if throwing is not desired.
   *
   * Note: the number of keys and messages must match.
   */
  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean;
  /** @param compressed Defaults to `true` */
  toBytes(compressed?: boolean): Uint8Array;
  /** @param compressed Defaults to `true` */
  toHex(compressed?: boolean): string;
}
