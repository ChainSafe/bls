/* eslint-disable require-atomic-updates */
import bls from "bls-eth-wasm";

type Bls = typeof bls;
let blsGlobal: Bls | null = null;
let blsGlobalPromise: Promise<Bls> | null = null;

export async function setupBls(): Promise<Bls> {
  if (!blsGlobal) {
    await bls.init();
    blsGlobal = bls;
  }
  return blsGlobal;
}

// Cache a promise for Bls instead of Bls to make sure it is initialized only once
export async function init(): Promise<Bls> {
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
    throw new Error("BLS not initialized");
  }
  return blsGlobal;
}
