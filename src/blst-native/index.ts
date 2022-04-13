import {SecretKey} from "./secretKey.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {IBls} from "../interface.js";
import {functionalInterfaceFactory} from "../functional.js";
export * from "../constants.js";

export {SecretKey, PublicKey, Signature};

export const bls: IBls = {
  implementation: "blst-native",
  SecretKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({SecretKey, PublicKey, Signature}),
};

export default bls;
