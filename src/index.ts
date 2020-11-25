import {IBls} from "./interface";
import {bls as blsHerumi} from "./herumi";

export type Implementation = "herumi" | "blst-native";

// TODO: Use a Proxy for example to throw an error if it's not initialized yet
export let bls: IBls;

async function getImplementation(impl: Implementation = "herumi"): Promise<IBls> {
  switch (impl) {
    case "herumi":
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      await blsHerumi.init();
      return blsHerumi;

    case "blst-native":
      if (typeof require !== "function") {
        throw Error("blst-native is only supported in NodeJS");
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./blst");

    default:
      throw new Error(`Unsupported implementation - ${impl}`);
  }
}

export async function init(impl: Implementation): Promise<void> {
  bls = await getImplementation(impl);
}

export default bls;
