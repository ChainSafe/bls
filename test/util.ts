import crypto from "crypto";

export function fromHexString(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex.replace("0x", ""), "hex"));
}

export function toHexString(bytes: Buffer | Uint8Array): string {
  return `0x${Buffer.from(bytes).toString("hex")}`;
}

export function randomMessage(): Uint8Array {
  return crypto.randomBytes(32);
}

export function getN<T>(n: number, getter: () => T): T[] {
  return Array.from({length: n}, () => getter());
}
