import {downloadTests} from "@lodestar/spec-test-util";
import {SPEC_TEST_VERSION, SPEC_TESTS_DIR, SPEC_TEST_TO_DOWNLOAD} from "./params.js";

/* eslint-disable no-console */

downloadTests(
  {
    specVersion: SPEC_TEST_VERSION,
    outputDir: SPEC_TESTS_DIR,
    testsToDownload: SPEC_TEST_TO_DOWNLOAD,
    specTestsRepoUrl: "https://github.com/ethereum/consensus-spec-tests",
  },
  console.log
).catch((e: any) => {
  console.error(e);
  process.exit(1);
});
