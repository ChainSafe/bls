import {PrivateKey} from "./privateKey";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {init, destroy} from "./context";
import {IBls} from "../interface";
import {functionalInterfaceFactory} from "../functional";
export * from "../constants";

export {PrivateKey, PublicKey, Signature, init, destroy};

export const bls: IBls = {
  PrivateKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({PrivateKey, PublicKey, Signature}),
  init,
  destroy,
};

export default bls;
