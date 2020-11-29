import randomBytes from "randombytes";

// Single import to ease changing this lib if necessary
export {randomBytes};

/**
 * Validate bytes to prevent confusing WASM errors downstream if bytes is null
 */
export function validateBytes(
  bytes: Uint8Array | Uint8Array[] | null,
  argName?: string
): asserts bytes is NonNullable<typeof bytes> {
  for (const item of Array.isArray(bytes) ? bytes : [bytes]) {
    if (item == null) {
      throw Error(`${argName || "bytes"} is null or undefined`);
    }
  }
}

export function isZeroUint8Array(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}
