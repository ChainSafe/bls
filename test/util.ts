import {randomBytes} from "../src/helpers";

export function randomMessage(): Uint8Array {
  return randomBytes(32);
}

export function getN<T>(n: number, getter: () => T): T[] {
  return Array.from({length: n}, () => getter());
}

export function range(n: number): number[] {
  const nums: number[] = [];
  for (let i = 0; i < n; i++) nums.push(i);
  return nums;
}
