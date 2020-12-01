import {IBls} from "./interface";
import {bls as blsHerumi} from "./herumi";

export type Implementation = "herumi" | "blst-native";

export * from "./interface";

// TODO: Use a Proxy for example to throw an error if it's not initialized yet
export const bls: IBls = {} as IBls;
export default bls;

async function getImplementation(impl: Implementation = "herumi"): Promise<IBls> {
  switch (impl) {
    case "herumi":
      await blsHerumi.init();
      return blsHerumi;

    case "blst-native":
      // Lazy import native bindings to prevent automatically importing binding.node files
      if (typeof require !== "function") {
        throw Error("blst-native is only supported in NodeJS");
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./blst").bls;

    default:
      throw new Error(`Unsupported implementation - ${impl}`);
  }
}

export async function init(impl: Implementation): Promise<void> {
  // Using Object.assign instead of just bls = getImplementation()
  // because otherwise the default import breaks. The reference is lost
  // and the imported object is still undefined after calling init()
  const blsImpl = await getImplementation(impl);
  Object.assign(bls, blsImpl);
  Object.assign(exports, blsImpl);
}

// Proxy named exports, will get set by `Object.assign(exports, blsImpl)`
export declare let sign: IBls["sign"];
export declare let aggregateSignatures: IBls["aggregateSignatures"];
export declare let aggregatePublicKeys: IBls["aggregatePublicKeys"];
export declare let verify: IBls["verify"];
export declare let verifyAggregate: IBls["verifyAggregate"];
export declare let verifyMultiple: IBls["verifyMultiple"];
export declare let secretKeyToPublicKey: IBls["secretKeyToPublicKey"];
