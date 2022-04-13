import {SecretKey} from "./secretKey.js";
import {PublicKey} from "./publicKey.js";
import {Signature} from "./signature.js";
import {init, destroy} from "./context.js";
import {IBls} from "../interface.js";
import {functionalInterfaceFactory} from "../functional.js";

await init();

export * from "../constants.js";

export {SecretKey, PublicKey, Signature, init, destroy};

export const bls: IBls = {
  implementation: "herumi",
  SecretKey,
  PublicKey,
  Signature,

  ...functionalInterfaceFactory({SecretKey, PublicKey, Signature}),
};

export default bls;
