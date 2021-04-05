import {runSecretKeyTests} from "./secretKey.test";
import {runPublicKeyTests} from "./publicKey.test";
import {runIndexTests} from "./index.test";
import {runMultithreadTests} from "./multithread/naive/naive.test";
import {describeForAllImplementations} from "../switch";

// Import test's bls lib lazily to prevent breaking test with Karma
describeForAllImplementations((bls) => {
  runSecretKeyTests(bls);
  runPublicKeyTests(bls);
  runIndexTests(bls);
  runMultithreadTests(bls);
});
