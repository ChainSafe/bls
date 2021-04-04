import {SecretKey} from "./secretKey";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {IBls} from "../interface";
import {functionalInterfaceFactory} from "../functional";
export * from "../constants";

export {SecretKey, PublicKey, Signature};

export async function init(): Promise<void> {
  // Native bindings require no init() call
}
export function destroy(): void {
  // Native bindings require no destroy() call
}

export const bls: IBls = {
  implementation: "blst-native",
  SecretKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({SecretKey, PublicKey, Signature}),
  init,
  destroy,
};

export default bls;
