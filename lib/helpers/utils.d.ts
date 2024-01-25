import randomBytes from "randombytes";
export { randomBytes };
/**
 * Validate bytes to prevent confusing WASM errors downstream if bytes is null
 */
export declare function validateBytes(bytes: Uint8Array | Uint8Array[] | null, argName?: string): asserts bytes is NonNullable<typeof bytes>;
export declare function isZeroUint8Array(bytes: Uint8Array): boolean;
export declare function concatUint8Arrays(bytesArr: Uint8Array[]): Uint8Array;
