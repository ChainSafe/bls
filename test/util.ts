export function fromHexString(hex: string): Buffer {
  return Buffer.from(hex.replace("0x", ""), "hex");
}

export function toHexString(bytes: Buffer | Uint8Array): string {
  return `0x${Buffer.from(bytes).toString("hex")}`;
}
