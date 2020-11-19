import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {bytesToHex, hexToBytes} from "../../src/helpers/utils";
import {SPEC_TESTS_DIR} from "../params";
import {forEachImplementation} from "../switch";

interface IAggregateSigsTestCase {
  data: {
    input: string[];
    output: string;
  };
}

forEachImplementation((bls, implementation) => {
  describeDirectorySpecTest<IAggregateSigsTestCase, string>(
    `${implementation} - bls/aggregate/small`,
    path.join(SPEC_TESTS_DIR, "general/phase0/bls/aggregate/small"),
    (testCase) => {
      try {
        const signatures = testCase.data.input;
        const agg = bls.aggregateSignatures(signatures.map(hexToBytes));
        return bytesToHex(agg);
      } catch (e) {
        if (e.message === "EMPTY_AGGREGATE_ARRAY") return null;
        throw e;
      }
    },
    {
      inputTypes: {data: InputType.YAML},
      getExpected: (testCase) => testCase.data.output,
    }
  );
});
