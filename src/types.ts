export interface IBls {
  implementation: Implementation;
  SecretKey: typeof SecretKey;
  PublicKey: typeof PublicKey;
  Signature: typeof Signature;

  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePublicKeys(publicKeys: Uint8Array[]): Uint8Array;
  aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean;
  verifyMultipleSignatures(sets: {publicKey: Uint8Array; message: Uint8Array; signature: Uint8Array}[]): boolean;
  secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array;
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
}

export declare class Signature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constructor(...value: any);
  /** @param type Only for impl `blst-native`. Defaults to `CoordType.affine`
   *  @param validate When using `herumi` implementation, signature validation is always on regardless of this flag. */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): Signature;
  static fromHex(hex: string): Signature;
  static aggregate(signatures: Signature[]): Signature;
  static verifyMultipleSignatures(sets: {publicKey: PublicKey; message: Uint8Array; signature: Signature}[]): boolean;
  verify(publicKey: PublicKey, message: Uint8Array): boolean;
  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean;
  /** @param format Defaults to `PointFormat.compressed` */
  toBytes(format?: PointFormat): Uint8Array;
  toHex(format?: PointFormat): string;
}

export type Implementation = "herumi" | "blst-native";

export enum PointFormat {
  compressed = "compressed",
  uncompressed = "uncompressed",
}

export enum CoordType {
  affine = 0,
  jacobian = 1,
}
