import {randomBytes} from "../src/helpers";

export function randomMessage(): Uint8Array {
  return randomBytes(32);
}

export function getN<T>(n: number, getter: () => T): T[] {
  return Array.from({length: n}, () => getter());
}
