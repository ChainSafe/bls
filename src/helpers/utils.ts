import {PUBLIC_KEY_LENGTH, SIGNATURE_LENGTH} from "../constants";

export function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const EMPTY_PUBLIC_KEY = Buffer.alloc(PUBLIC_KEY_LENGTH);
export const EMPTY_SIGNATURE = Buffer.alloc(SIGNATURE_LENGTH);
