import blst from "@chainsafe/blst";
import { CoordType, PointFormat, PublicKey as IPublicKey, PublicKeyArg } from "../types.js";
export declare class PublicKey implements IPublicKey {
    private readonly value;
    private constructor();
    /** @param type Defaults to `CoordType.jacobian` */
    static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): PublicKey;
    static fromHex(hex: string): PublicKey;
    static aggregate(publicKeys: PublicKeyArg[]): PublicKey;
    static convertToBlstPublicKeyArg(publicKey: PublicKeyArg): blst.PublicKeyArg;
    /**
     * Implemented for SecretKey to be able to call .toPublicKey()
     */
    private static friendBuild;
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
    multiplyBy(bytes: Uint8Array): PublicKey;
}
