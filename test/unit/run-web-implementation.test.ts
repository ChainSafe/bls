import herumi from "../../src/herumi";
import {runPrivateKeyTests} from "./privateKey.test";
import {runPublicKeyTests} from "./publicKey.test";
// import {runKeypairTests} from "./keypair.test";
import {runIndexTests} from "./index.test";

// This file is intended to be compiled and run by Karma
// Do not import the node.bindings or it will break with:
// Error: BLST bindings loader should only run in a NodeJS context: process.platform
describe("herumi", () => {
  before(async () => {
    // For consistency with describeForAllImplementations
    // eslint-disable-next-line import/no-named-as-default-member
    await herumi.initBLS();
  });

  runPrivateKeyTests(herumi);
  runPublicKeyTests(herumi);
  // runKeypairTests(bls);
  runIndexTests(herumi);
});
