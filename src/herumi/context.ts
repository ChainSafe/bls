/* eslint-disable require-atomic-updates */
import bls from "bls-eth-wasm";
import {randomBytes} from "@noble/hashes/utils";
import {NotInitializedError} from "../errors.js";

type Bls = typeof bls;
let blsGlobal: Bls | null = null;
let blsGlobalPromise: Promise<void> | null = null;

export async function setupBls(): Promise<void> {
  if (!blsGlobal) {
    await bls.init(bls.BLS12_381);

    // Patch to fix multiVerify() calls on a browser with polyfilled NodeJS crypto
    if (typeof window === "object") {
      // @ts-expect-error getRandomValues is not typed in `bls-eth-wasm` because it's not meant to be exposed
      bls.getRandomValues = (x: Uint8Array) => {
        const rand = randomBytes(x.byteLength);
        for (let i = 0; i < x.byteLength; i++) {
          x[i] = rand[i];
        }
      };
    }

    blsGlobal = bls;
  }
}

// Cache a promise for Bls instead of Bls to make sure it is initialized only once
export async function init(): Promise<void> {
  if (!blsGlobalPromise) {
    blsGlobalPromise = setupBls();
  }
  return blsGlobalPromise;
}

export function destroy(): void {
  blsGlobal = null;
  blsGlobalPromise = null;
}

export function getContext(): Bls {
  if (!blsGlobal) {
    throw new NotInitializedError("herumi");
  }
  return blsGlobal;
}
