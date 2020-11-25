import {IBls} from "./interface";
import blsHerumi from "./herumi";

export type Implementation = "herumi" | "blst-native";

// TODO: Use a Proxy for example to throw an error if it's not initialized yet
export let bls: IBls;

async function getImplementation(impl: Implementation) {
  switch (impl) {
    case "herumi":
      await blsHerumi.init();
      return blsHerumi;

    case "blst-native":
      if (typeof require !== "function") {
        throw Error("blst-native is only supported in NodeJS");
      }
      return require("./blst");

    default:
      throw new Error(`Unsupported implementation - ${impl}`);
  }
}

export async function init(impl: Implementation) {
  bls = await getImplementation(impl);
}

export default bls;
