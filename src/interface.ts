export interface IBls {
  implementation: Implementation;
  SecretKey: Omit<typeof SecretKey, "prototype">;
  PublicKey: Omit<typeof PublicKey, "prototype">;
  Signature: Omit<typeof Signature, "prototype">;

  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array;
  aggregatePublicKeys(publicKeys: Uint8Array[]): Uint8Array;
  aggregateSignatures(signatures: Uint8Array[]): Uint8Array;
  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
  verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean;
  verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean;
  verifyMultipleSignatures(sets: {publicKey: Uint8Array; message: Uint8Array; signature: Uint8Array}[]): boolean;
  secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array;

  init(): Promise<void>;
  destroy(): void;
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
  /** @param type Only for impl `blst-native`. Defaults to `CoordType.jacobian` */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): PublicKey;
  static fromHex(hex: string): PublicKey;
  static aggregate(publicKeys: PublicKey[]): PublicKey;
  /** @param format Defaults to `PointFormat.compressed` */
  toBytes(format?: PointFormat): Uint8Array;
  toHex(format?: PointFormat): string;
}

export declare class Signature {
  /** @param type Only for impl `blst-native`. Defaults to `CoordType.affine` */
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
  affine,
  jacobian,
}
