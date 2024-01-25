/* eslint-disable require-atomic-updates */
import bls from "bls-eth-wasm";
import { NotInitializedError } from "../errors.js";
let blsGlobal = null;
let blsGlobalPromise = null;
export async function setupBls() {
    if (!blsGlobal) {
        await bls.init(bls.BLS12_381);
        // Patch to fix multiVerify() calls on a browser with polyfilled NodeJS crypto
        if (typeof window === "object") {
            const crypto = window.crypto || window.msCrypto;
            // getRandomValues is not typed in `bls-eth-wasm` because it's not meant to be exposed
            // @ts-ignore
            bls.getRandomValues = (x) => crypto.getRandomValues(x);
        }
        blsGlobal = bls;
    }
}
// Cache a promise for Bls instead of Bls to make sure it is initialized only once
export async function init() {
    if (!blsGlobalPromise) {
        blsGlobalPromise = setupBls();
    }
    return blsGlobalPromise;
}
export function destroy() {
    blsGlobal = null;
    blsGlobalPromise = null;
}
export function getContext() {
    if (!blsGlobal) {
        throw new NotInitializedError("herumi");
    }
    return blsGlobal;
}
