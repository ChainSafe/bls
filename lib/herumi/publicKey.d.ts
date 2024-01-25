import type { PublicKeyType } from "bls-eth-wasm";
import { PointFormat, PublicKey as IPublicKey } from "../types.js";
export declare class PublicKey implements IPublicKey {
    readonly value: PublicKeyType;
    constructor(value: PublicKeyType);
    static fromBytes(bytes: Uint8Array): PublicKey;
    static fromHex(hex: string): PublicKey;
    static aggregate(publicKeys: PublicKey[]): PublicKey;
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
}
