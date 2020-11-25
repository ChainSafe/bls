import {IBls} from "./interface";
import blsHerumi from "./herumi";

export type Implementation = "herumi" | "blst-native";

// This proxy makes sure a nice error is printed if BLS is used before init()
export let bls: IBls = new Proxy({} as IBls, {
  get: function () {
    throw Error("BLS not initialized, call init() before");
  },
});

async function getImplementation(impl: Implementation) {
  switch (impl) {
    case "herumi":
      await blsHerumi.initBLS();
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
