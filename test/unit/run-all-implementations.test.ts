import {runSecretKeyTests} from "./secretKey.test";
import {runPublicKeyTests} from "./publicKey.test";
// import {runKeypairTests} from "./keypair.test";
import {runIndexTests} from "./index.test";
import {describeForAllImplementations} from "../switch";

// Import test's bls lib lazily to prevent breaking test with Karma
describeForAllImplementations((bls) => {
  runSecretKeyTests(bls);
  runPublicKeyTests(bls);
  // runKeypairTests(bls);
  runIndexTests(bls);
});
