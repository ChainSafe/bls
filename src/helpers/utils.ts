export function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function hexToBytes(hex: string): Uint8Array {
  return Buffer.from(hex.replace("0x", ""), "hex");
}

export function bytesToHex(bytes: Uint8Array): string {
  return "0x" + Buffer.from(bytes).toString("hex");
}

export function isEqualBytes(a: Buffer | Uint8Array, b: Buffer | Uint8Array): boolean {
  return toBuffer(a).equals(toBuffer(b));
}

export function toBuffer(input: Uint8Array): Buffer {
  return Buffer.from(input.buffer, input.byteOffset, input.length);
}
