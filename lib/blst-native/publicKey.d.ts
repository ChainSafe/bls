import { PointFormat, PublicKey as IPublicKey, CoordType } from "../types.js";
export declare class PublicKey implements IPublicKey {
    private readonly key;
    private constructor();
    /** @param type Defaults to `CoordType.jacobian` */
    static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): PublicKey;
    static fromHex(hex: string): PublicKey;
    static aggregate(publicKeys: PublicKey[]): PublicKey;
    private static friendBuild;
    toBytes(format?: PointFormat): Uint8Array;
    toHex(format?: PointFormat): string;
}
