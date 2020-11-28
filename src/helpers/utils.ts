import randomBytes from "randombytes";

// Single import to ease changing this lib if necessary
export {randomBytes};

export function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function isEqualBytes(a: Buffer | Uint8Array, b: Buffer | Uint8Array): boolean {
  return toBuffer(a).equals(toBuffer(b));
}

export function toBuffer(input: Uint8Array): Buffer {
  return Buffer.from(input.buffer, input.byteOffset, input.length);
}
