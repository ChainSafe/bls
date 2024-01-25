import randomBytes from "randombytes";
// Single import to ease changing this lib if necessary
export { randomBytes };
/**
 * Validate bytes to prevent confusing WASM errors downstream if bytes is null
 */
export function validateBytes(bytes, argName) {
    for (const item of Array.isArray(bytes) ? bytes : [bytes]) {
        if (item == null) {
            throw Error(`${argName || "bytes"} is null or undefined`);
        }
    }
}
export function isZeroUint8Array(bytes) {
    return bytes.every((byte) => byte === 0);
}
export function concatUint8Arrays(bytesArr) {
    const totalLen = bytesArr.reduce((total, bytes) => total + bytes.length, 0);
    const merged = new Uint8Array(totalLen);
    let mergedLen = 0;
    for (const bytes of bytesArr) {
        merged.set(bytes, mergedLen);
        mergedLen += bytes.length;
    }
    return merged;
}
