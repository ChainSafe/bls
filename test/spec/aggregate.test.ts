import path from "path";
import {describeDirectorySpecTest, InputType} from "@lodestar/spec-test-util";
import {bytesToHex, hexToBytes} from "../../src/helpers/index.js";
import {SPEC_TESTS_DIR} from "../params.js";
import {describeForAllImplementations} from "../switch.js";
import {EmptyAggregateError} from "../../src/errors.js";

interface IAggregateSigsTestCase {
  data: {
    input: string[];
    output: string;
  };
  meta?: undefined;
}

describeForAllImplementations((bls) => {
  describeDirectorySpecTest<IAggregateSigsTestCase, string | null>(
    "bls/aggregate/small",
    path.join(SPEC_TESTS_DIR, "tests/general/phase0/bls/aggregate/small"),
    (testCase) => {
      try {
        const signatures = testCase.data.input;
        const agg = bls.aggregateSignatures(signatures.map(hexToBytes));
        return bytesToHex(agg);
      } catch (e) {
        if (e instanceof EmptyAggregateError) return null;
        throw e;
      }
    },
    {
      inputTypes: {data: InputType.YAML},
      getExpected: (testCase) => testCase.data.output,
    }
  );
});
