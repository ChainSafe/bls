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

export function isZeroUint8Array(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}

export function concatUint8Arrays(bytesArr: Uint8Array[]): Uint8Array {
  const totalLen = bytesArr.reduce((total, bytes) => total + bytes.length, 0);

  const merged = new Uint8Array(totalLen);
  let mergedLen = 0;

  for (const bytes of bytesArr) {
    merged.set(bytes, mergedLen);
    mergedLen += bytes.length;
  }

  return merged;
}
