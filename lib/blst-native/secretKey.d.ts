import * as blst from "@chainsafe/blst-ts";
import { SecretKey as ISecretKey } from "../types.js";
import { PublicKey } from "./publicKey.js";
import { Signature } from "./signature.js";
export declare class SecretKey implements ISecretKey {
    private readonly key;
    constructor(key: blst.SecretKey);
    static fromBytes(bytes: Uint8Array): SecretKey;
    static fromHex(hex: string): SecretKey;
    static fromKeygen(entropy?: Uint8Array): SecretKey;
    sign(message: Uint8Array): Signature;
    toPublicKey(): PublicKey;
    toBytes(): Uint8Array;
    toHex(): string;
}
