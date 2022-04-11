import {IBls, Implementation} from "./interface.js";

export {IBls, Implementation, CoordType, PointFormat} from "./interface.js";

// TODO: Use a Proxy for example to throw an error if it's not initialized yet
export const bls: IBls = {} as IBls;
export default bls;

// Thanks https://github.com/iliakan/detect-node/blob/master/index.esm.js
const isNode = Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";

async function getImplementation(impl: Implementation = "herumi"): Promise<IBls> {
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

export async function init(impl: Implementation): Promise<void> {
  // Using Object.assign instead of just bls = getImplementation()
  // because otherwise the default import breaks. The reference is lost
  // and the imported object is still undefined after calling init()
  const blsImpl = await getImplementation(impl);
  Object.assign(bls, blsImpl);
}
