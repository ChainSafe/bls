import {runPrivateKeyTests} from "./privateKey.test";
import {runPublicKeyTests} from "./publicKey.test";
// import {runKeypairTests} from "./keypair.test";
import {runIndexTests} from "./index.test";
import {forEachImplementation} from "../switch";

// Import test's bls lib lazily to prevent breaking test with Karma
forEachImplementation(["blst", "herumi"], (bls) => {
  runPrivateKeyTests(bls);
  runPublicKeyTests(bls);
  // runKeypairTests(bls);
  runIndexTests(bls);
});
