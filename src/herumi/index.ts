import {SecretKey} from "./secretKey.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {init, destroy} from "./context.js";
import {IBls, Implementation} from "../types.js";
import {functionalInterfaceFactory} from "../functional.js";

await init();

export * from "../constants.js";

export {SecretKey, PublicKey, Signature, init, destroy};

const implementation: Implementation = "herumi";
export const bls: IBls = {
  implementation,
  SecretKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({implementation, SecretKey, PublicKey, Signature}),
};

export default bls;
