import assert from "assert";
import crypto from "crypto";

/**
 * Pads byte array with zeroes on left side up to desired length.
 * Throws if source is larger than desired result.
 * @param source
 * @param length
 */
export function padLeft(source: Uint8Array, length: number): Buffer {
  assert(source.length <= length, "Given array must be smaller or equal to desired array size");
  const result = Buffer.alloc(length, 0);
  result.set(source, length - source.length);
  return result;
}

export function hexToBytes(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex.replace("0x", ""), "hex"));
}

export function bytesToHex(bytes: Uint8Array): string {
  return "0x" + Buffer.from(bytes).toString("hex");
}

export function getRandomBytes(size: number): Uint8Array {
  return Uint8Array.from(crypto.randomBytes(size));
}

export function isEqualBytes(a: Buffer | Uint8Array, b: Buffer | Uint8Array): boolean {
  return Buffer.from(a).equals(Buffer.from(b));
}

export function toBuffer(input: Uint8Array): Buffer {
  return Buffer.from(input.buffer, input.byteOffset, input.length);
}
