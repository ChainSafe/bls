/* eslint-disable require-atomic-updates */
import bls from "bls-eth-wasm";
import {NotInitializedError} from "../errors";

type Bls = typeof bls;
let blsGlobal: Bls | null = null;
let blsGlobalPromise: Promise<void> | null = null;

export async function setupBls(): Promise<void> {
  if (!blsGlobal) {
    await bls.init(bls.BLS12_381);
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
