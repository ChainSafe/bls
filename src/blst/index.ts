import {PrivateKey} from "./privateKey";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {IBls} from "../interface";
export * from "../constants";
import {functionalInterfaceFactory} from "../functional";

export {PrivateKey, PublicKey, Signature};

export async function initBLS(): Promise<void> {
  // Native bindings require no init() call
}
export function destroy(): void {
  // Native bindings require no destroy() call
}

export const bls: IBls = {
  PrivateKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({PrivateKey, PublicKey, Signature}),
  initBLS,
  destroy,
};

export default bls;
