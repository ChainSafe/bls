import {IBls} from "./interface";
import {bls as blsHerumi} from "./herumi";

export type Implementation = "herumi" | "blst-native";

export * from "./interface";

// TODO: Use a Proxy for example to throw an error if it's not initialized yet
export const bls: IBls = {} as IBls;

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
  Object.assign(bls, await getImplementation(impl));
}

export default bls;
