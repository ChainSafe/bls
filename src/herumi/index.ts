import {SecretKey} from "./secretKey";
import {PublicKey} from "./publicKey";
import {Signature} from "./signature";
import {init, destroy} from "./context";
import {IBls} from "../interface";
import {functionalInterfaceFactory} from "../functional";
export * from "../constants";

export {SecretKey, PublicKey, Signature, init, destroy};

export const bls: IBls = {
  SecretKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({SecretKey, PublicKey, Signature}),
  init,
  destroy,
};

export default bls;
