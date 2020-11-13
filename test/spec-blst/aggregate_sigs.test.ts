import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {AggregateSignature} from "@chainsafe/blst-ts";
import {fromHexString, toHexString} from "../util";

interface IAggregateSigsTestCase {
  data: {
    input: string[];
    output: string;
  };
}

describeDirectorySpecTest<IAggregateSigsTestCase, string>(
  "BLS - aggregate sigs",
  path.join(__dirname, "../../node_modules/@chainsafe/eth2-spec-tests/tests/general/phase0/bls/aggregate/small"),
  (testCase) => {
    const signaturesHex = testCase.data.input;
    const signaturesBytes = signaturesHex.map(fromHexString);
    const aggSig = AggregateSignature.fromSignaturesBytes(signaturesBytes);
    const aggSigHex = aggSig.toSignature().toBytes();
    return toHexString(aggSigHex);
  },
  {
    inputTypes: {
      data: InputType.YAML,
    },
    getExpected: (testCase) => testCase.data.output,
  }
);
