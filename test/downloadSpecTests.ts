import {downloadTests} from "@chainsafe/lodestar-spec-test-util";
import {SPEC_TEST_VERSION, SPEC_TESTS_DIR, SPEC_TEST_TO_DOWNLOAD} from "./params";

/* eslint-disable no-console */

downloadTests(
  {
    specVersion: SPEC_TEST_VERSION,
    outputDir: SPEC_TESTS_DIR,
    testsToDownload: SPEC_TEST_TO_DOWNLOAD,
  },
  console.log
).catch((e) => {
  console.error(e);
  process.exit(1);
});
