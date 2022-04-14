import herumi from "../../src/herumi/index.js";
import {runSecretKeyTests} from "../unit/secretKey.test.js";
import {runPublicKeyTests} from "../unit/publicKey.test.js";
import {runIndexTests} from "../unit/index.test.js";

// This file is intended to be compiled and run by Karma
// Do not import the node.bindings or it will break with:
// Error: BLST bindings loader should only run in a NodeJS context: process.platform
describe("herumi", () => {
  runSecretKeyTests(herumi);
  runPublicKeyTests(herumi);
  runIndexTests(herumi);
});
