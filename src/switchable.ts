import type {IBls, Implementation} from "./interface.js";
import {getImplementation} from "./getImplementation.js";

// TODO: Use a Proxy for example to throw an error if it's not initialized yet
const bls: IBls = {} as IBls;
export default bls;

export async function init(impl: Implementation): Promise<void> {
  // Using Object.assign instead of just bls = getImplementation()
  // because otherwise the default import breaks. The reference is lost
  // and the imported object is still undefined after calling init()
  const blsImpl = await getImplementation(impl);
  Object.assign(bls, blsImpl);
}
