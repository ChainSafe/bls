import assert from "assert";
import {PUBLIC_KEY_LENGTH, SIGNATURE_LENGTH} from "../constants";

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

export function validateBytes(bytesObj: {[argName: string]: Uint8Array | Uint8Array[]}): void {
  for (const [argName, bytes] of Object.entries(bytesObj)) {
    assert(bytes, `${argName} is null or undefined`);
  }
}

export const EMPTY_PUBLIC_KEY = Buffer.alloc(PUBLIC_KEY_LENGTH);
export const EMPTY_SIGNATURE = Buffer.alloc(SIGNATURE_LENGTH);
