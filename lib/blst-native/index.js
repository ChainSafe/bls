import { SecretKey } from "./secretKey.js";
import { PublicKey } from "./publicKey.js";
import { Signature } from "./signature.js";
import { functionalInterfaceFactory } from "../functional.js";
export * from "../constants.js";
export { SecretKey, PublicKey, Signature };
const implementation = "blst-native";
export const bls = {
    implementation,
    SecretKey,
    PublicKey,
    Signature,
    ...functionalInterfaceFactory({ implementation, SecretKey, PublicKey, Signature }),
};
export default bls;
