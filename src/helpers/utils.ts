export function validateBytes(bytesObj: {[argName: string]: Uint8Array | Uint8Array[]}): void {
  for (const [argName, bytes] of Object.entries(bytesObj)) {
    for (const item of Array.isArray(bytes) ? bytes : [bytes]) {
      if (item == null) {
        throw Error(`${argName} is null or undefined`);
      }
    }
  }
}
