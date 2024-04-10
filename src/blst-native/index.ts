import {SecretKey} from "./secretKey.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {IBls, Implementation} from "../types.js";
import {functionalInterfaceFactory} from "../functional.js";
export * from "../constants.js";

export {SecretKey, PublicKey, Signature};

const implementation: Implementation = "blst-native";
export const bls: IBls = {
  implementation,
  SecretKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({implementation, SecretKey, PublicKey, Signature}),
};

export default bls;
