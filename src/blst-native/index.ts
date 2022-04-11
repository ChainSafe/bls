import {SecretKey} from "./secretKey.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {IBls} from "../interface.js";
import {functionalInterfaceFactory} from "../functional.js";
export * from "../constants.js";

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
