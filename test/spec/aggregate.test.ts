import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {bytesToHex, hexToBytes} from "../../src/helpers";
import {SPEC_TESTS_DIR} from "../params";
import {describeForAllImplementations} from "../switch";
import {EmptyAggregateError, ZeroSignatureError} from "../../src/errors";

interface IAggregateSigsTestCase {
  data: {
    input: string[];
    output: string;
  };
}

describeForAllImplementations((bls) => {
  describeDirectorySpecTest<IAggregateSigsTestCase, string>(
    "bls/aggregate/small",
    path.join(SPEC_TESTS_DIR, "general/phase0/bls/aggregate/small"),
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
