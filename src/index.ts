import {IBls, IPrivateKey, IPublicKey, ISignature} from "./interface";
import {bls as blsHerumi} from "./herumi";

export type Implementation = "herumi" | "blst-native";

export * from "./interface";

// TODO: Use a Proxy for example to throw an error if it's not initialized yet
export const bls: IBls = {} as IBls;
export default bls;

async function getImplementation(impl: Implementation = "herumi"): Promise<IBls> {
  switch (impl) {
    case "herumi":
      await blsHerumi.init();
      return blsHerumi;

    case "blst-native":
      // Lazy import native bindings to prevent automatically importing binding.node files
      if (typeof require !== "function") {
        throw Error("blst-native is only supported in NodeJS");
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./blst").bls;

    default:
      throw new Error(`Unsupported implementation - ${impl}`);
  }
}

export async function init(impl: Implementation): Promise<void> {
  // Using Object.assign instead of just bls = getImplementation()
  // because otherwise the default import breaks. The reference is lost
  // and the imported object is still undefined after calling init()
  const blsImpl = await getImplementation(impl);
  Object.assign(bls, blsImpl);
  Object.assign(exports, blsImpl);
}

// Proxy named exports, will get set by `Object.assign(exports, blsImpl)`
export declare let sign: IBls["sign"];
export declare let aggregateSignatures: IBls["aggregateSignatures"];
export declare let aggregatePubkeys: IBls["aggregatePubkeys"];
export declare let verify: IBls["verify"];
export declare let verifyAggregate: IBls["verifyAggregate"];
export declare let verifyMultiple: IBls["verifyMultiple"];

export declare class PrivateKey implements IPrivateKey {
  static fromBytes(bytes: Uint8Array): PrivateKey;
  static fromHex(hex: string): PrivateKey;
  static fromKeygen(entropy?: Uint8Array): PrivateKey;
  sign(message: Uint8Array): Signature;
  toPublicKey(): PublicKey;
  toBytes(): Uint8Array;
  toHex(): string;
}

export declare class PublicKey implements IPublicKey {
  static fromBytes(bytes: Uint8Array): PublicKey;
  static fromHex(hex: string): PublicKey;
  static aggregate(pubkeys: PublicKey[]): PublicKey;
  toBytes(): Uint8Array;
  toHex(): string;
  // Virtual property so PublicKey type != Signature type
  private isPublicKey: true; 
}

export declare class Signature implements ISignature {
  static fromBytes(bytes: Uint8Array): Signature;
  static fromHex(hex: string): Signature;
  static aggregate(signatures: Signature[]): Signature;
  verify(publicKey: PublicKey, message: Uint8Array): boolean;
  verifyAggregate(publicKeys: PublicKey[], message: Uint8Array): boolean;
  verifyMultiple(publicKeys: PublicKey[], messages: Uint8Array[]): boolean;
  toBytes(): Uint8Array;
  toHex(): string;
}
