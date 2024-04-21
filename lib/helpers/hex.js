/**
 * Browser compatible fromHex method
 * From https://github.com/herumi/bls-eth-wasm/blob/04eedb77aa96e66b4f65a0ab477228adf8090c36/src/bls.js#L62
 */
export function hexToBytes(hex) {
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    if (hex.length & 1) {
        throw Error("hexToBytes:length must be even " + hex.length);
    }
    const n = hex.length / 2;
    const a = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        a[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return a;
}
/**
 * Browser compatible toHex method
 * From https://github.com/herumi/bls-eth-wasm/blob/04eedb77aa96e66b4f65a0ab477228adf8090c36/src/bls.js#L50
 */
export function bytesToHex(bytes) {
    let s = "";
    const n = bytes.length;
    for (let i = 0; i < n; i++) {
        s += ("0" + bytes[i].toString(16)).slice(-2);
    }
    return "0x" + s;
}
