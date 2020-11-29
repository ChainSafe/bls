import randomBytes from "randombytes";

// Single import to ease changing this lib if necessary
export {randomBytes};

export function isEqualBytes(a: Buffer | Uint8Array, b: Buffer | Uint8Array): boolean {
  return toBuffer(a).equals(toBuffer(b));
}

export function toBuffer(input: Uint8Array): Buffer {
  return Buffer.from(input.buffer, input.byteOffset, input.length);
}

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
