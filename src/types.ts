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

  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePublicKeys(publicKeys: PublicKeyArg[]): Uint8Array;
  aggregateSignatures(signatures: SignatureArg[]): Uint8Array;
  verify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): boolean;
  verifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array, signature: SignatureArg): boolean;
  verifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg): boolean;
  verifyMultipleSignatures(sets: SignatureSet[]): boolean;
  secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array;
  asyncVerify(publicKey: PublicKeyArg, message: Uint8Array, signature: SignatureArg): Promise<boolean>;
  asyncVerifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array, signature: SignatureArg): Promise<boolean>;
  asyncVerifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[], signature: SignatureArg): Promise<boolean>;
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
  static aggregate(publicKeys: PublicKey[]): PublicKey;
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
  static aggregate(signatures: Signature[]): Signature;
  static verifyMultipleSignatures(sets: SignatureSet[]): boolean;
  static asyncVerifyMultipleSignatures(sets: SignatureSet[]): Promise<boolean>;
  verify(publicKey: PublicKey, message: Uint8Array): boolean;
  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean;
  asyncVerify(publicKey: PublicKeyArg, message: Uint8Array): Promise<boolean>;
  asyncVerifyAggregate(publicKeys: PublicKeyArg[], message: Uint8Array): Promise<boolean>;
  asyncVerifyMultiple(publicKeys: PublicKeyArg[], messages: Uint8Array[]): Promise<boolean>;
  /** @param format Defaults to `PointFormat.compressed` */
  toBytes(format?: PointFormat): Uint8Array;
  toHex(format?: PointFormat): string;
  multiplyBy(bytes: Uint8Array): Signature;
}
