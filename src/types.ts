export type Implementation = "herumi" | "blst-native";
export type PublicKeyArg = PublicKey | Uint8Array;
export type SignatureArg = Signature | Uint8Array;

export interface SignatureSet {
  message: Uint8Array;
  publicKey: PublicKeyArg;
  signature: SignatureArg;
}

export enum PointFormat {
  compressed = "compressed",
  uncompressed = "uncompressed",
}

/**
 * NOTE: This MUST match the type used in @chainsafe/blst.  Do not use the one
 * exported by that library though or it will mess up tree shaking.  Use the one
 * below instead by MAKE SURE if you change this that it matches the enum values
 * used by the native bindings in the base library!!!!  Better yet do not modify
 * this unless you are ABSOLUTELY SURE you know what you are doing...
 */
/**
 * CoordType allows switching between affine and jacobian version of underlying
 * bls points.
 */
export enum CoordType {
  affine = 0,
  jacobian = 1,
}

export interface IBls {
  implementation: Implementation;
  SecretKey: typeof SecretKey;
  PublicKey: typeof PublicKey;
  Signature: typeof Signature;

  secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array;
  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePublicKeys(publicKeys: PublicKeyArg[]): Uint8Array;
  aggregateSignatures(signatures: SignatureArg[]): Uint8Array;
  /**
   * Will synchronously verify a signature. This function catches invalid input and return false for
   * bad keys or signatures. Use the `Signature.verify` method if throwing is desired.
   */
  verify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): boolean;
  /**
   * Will synchronously verify a signature over a message by multiple aggregated keys. This function
   * catches invalid input and return false for bad keys or signatures. Use the
   * `Signature.verifyAggregate` if throwing is desired.
   */
  verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array, signature: SignatureArg): boolean;
  /**
   * Will synchronously verify an aggregated signature over a number of messages each signed by a
   * different key. This function catches invalid input and return false for bad keys or signatures.
   * Use the `Signature.verifyAggregate` if throwing is desired.
   *
   * Note: the number of keys and messages must match.
   */
  verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg): boolean;
  /**
   * Will synchronously verify a group of SignatureSets where each contains a signature signed for
   * a message by a public key. This function catches invalid input and return false for bad keys or
   * signatures. Use the `Signature.verifyMultipleSignatures` if throwing is desired.
   */
  verifyMultipleSignatures(sets: SignatureSet[]): boolean;
  /**
   * Will asynchronously verify a signature. This function catches invalid input and return false for
   * bad keys or signatures. Use the `Signature.asyncVerify` method if throwing is desired.
   */
  asyncVerify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): Promise<boolean>;
  /**
   * Will asynchronously verify a signature over a message by multiple aggregated keys. This function
   * catches invalid input and return false for bad keys or signatures. Use the
   * `Signature.asyncVerifyAggregate` if throwing is desired.
   */
  asyncVerifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array, signature: SignatureArg): Promise<boolean>;
  /**
   * Will asynchronously verify an aggregated signature over a number of messages each signed by a
   * different key. This function catches invalid input and return false for bad keys or signatures.
   * Use the `Signature.asyncVerifyAggregate` if throwing is desired.
   *
   * Note: the number of keys and messages must match.
   */
  asyncVerifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg): Promise<boolean>;
  /**
   * Will asynchronously verify a group of SignatureSets where each contains a signature signed for
   * a message by a public key. This function catches invalid input and return false for bad keys or
   * signatures. Use the Signature.asyncVerifyMultipleSignatures if throwing is desired.
   */
  asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean>;
}

export declare class SecretKey {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constructor(...value: any);
  static fromBytes(bytes: Uint8Array): SecretKey;
  static fromHex(hex: string): SecretKey;
  static fromKeygen(entropy?: Uint8Array): SecretKey;
  sign(message: Uint8Array): Signature;
  toPublicKey(): PublicKey;
  toBytes(): Uint8Array;
  toHex(): string;
}

export declare class PublicKey {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constructor(...value: any);
  /** @param type Only for impl `blst-native`. Defaults to `CoordType.jacobian` */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): PublicKey;
  static fromHex(hex: string): PublicKey;
  static aggregate(publicKeys: PublicKeyArg[]): PublicKey;
  /** @param format Defaults to `PointFormat.compressed` */
  toBytes(format?: PointFormat): Uint8Array;
  toHex(format?: PointFormat): string;
  multiplyBy(bytes: Uint8Array): PublicKey;
}

export declare class Signature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constructor(...value: any);
  /** @param type Only for impl `blst-native`. Defaults to `CoordType.affine`
   *  @param validate When using `herumi` implementation, signature validation is always on regardless of this flag. */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): Signature;
  static fromHex(hex: string): Signature;
  static aggregate(signatures: SignatureArg[]): Signature;
  /**
   * Will synchronously verify a group of SignatureSets where each contains a signature signed for
   * a message by a public key. This version of the function will potentially throw errors for
   * invalid input. Use the free function `verifyMultipleSignatures` if throwing is not desired.
   */
  static verifyMultipleSignatures(sets: SignatureSet[]): boolean;
  /**
   * Will asynchronously verify a group of SignatureSets where each contains a signature signed for
   * a message by a public key. This version of the function will potentially throw errors for
   * invalid input. Use the free function `verifyMultipleSignatures` if throwing is not desired.
   */
  static asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean>;
  /**
   * Will synchronously verify a signature. This version of the function will potentially throw
   * errors for invalid input. Use the free function `verify` if throwing is not desired.
   */
  verify(publicKey: PublicKeyArg, message: Uint8Array): boolean;
  /**
   * Will synchronously verify a signature over a message by multiple aggregated keys.  This
   * version of the function will potentially throw errors for invalid input. Use the free function
   * `verifyAggregate` if throwing is not desired.
   */
  verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): boolean;
  /**
   * Will synchronously verify an aggregated signature over a number of messages each signed by a
   * different key. This version of the function will potentially throw errors for invalid input.
   * Use the free function `verifyMultiple` if throwing is not desired.
   *
   * Note: the number of keys and messages must match.
   */
  verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): boolean;
  /**
   * Will asynchronously verify a signature.  This version of the function will potentially throw
   * errors for invalid input. Use the free function `asyncVerify` if throwing is not desired.
   */
  asyncVerify(publicKey: PublicKeyArg, message: Uint8Array): Promise<boolean>;
  /**
   * Will asynchronously verify a signature over a message by multiple aggregated keys.  This
   * version of the function will potentially throw errors for invalid input. Use the free function
   * `asyncVerifyAggregate` if throwing is not desired.
   */
  asyncVerifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): Promise<boolean>;
  /**
   * Will asynchronously verify an aggregated signature over a number of messages each signed by a
   * different key. This version of the function will potentially throw errors for invalid input.
   * Use the free function `asyncVerifyMultiple` if throwing is not desired.
   *
   * Note: the number of keys and messages must match.
   */
  asyncVerifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): Promise<boolean>;
  /**
   * @default format - `PointFormat.compressed`
   */
  toBytes(format?: PointFormat): Uint8Array;
  toHex(format?: PointFormat): string;
  multiplyBy(bytes: Uint8Array): Signature;
}
