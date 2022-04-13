import type {IBls, Implementation} from "./interface.js";

// Thanks https://github.com/iliakan/detect-node/blob/master/index.esm.js
const isNode = Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";

export async function getImplementation(impl: Implementation = "herumi"): Promise<IBls> {
  switch (impl) {
    case "herumi": {
      const blsHerumi = (await import("./herumi/index.js")).bls;
      await blsHerumi.init();
      return blsHerumi;
    }

    case "blst-native":
      // Lazy import native bindings to prevent automatically importing binding.node files
      if (!isNode) {
        throw Error("blst-native is only supported in NodeJS");
      }
      return (await import("./blst-native/index.js")).bls;

    default:
      throw new Error(`Unsupported implementation - ${impl}`);
  }
}
