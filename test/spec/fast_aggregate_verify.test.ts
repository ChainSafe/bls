import path from "path";
import {describeDirectorySpecTest, InputType} from "@lodestar/spec-test-util";
import {hexToBytes} from "../../src/helpers/index.js";
import {SPEC_TESTS_DIR} from "../params.js";
import {describeForAllImplementations} from "../switch.js";
import {CoordType} from "@chainsafe/blst";

interface IAggregateSigsVerifyTestCase {
  data: {
    input: {
      pubkeys: string[];
      message: string;
      signature: string;
    };
    output: boolean;
  };
  meta?: undefined;
}

describeForAllImplementations((bls) => {
  describeDirectorySpecTest<IAggregateSigsVerifyTestCase, boolean>(
    "bls/fast_aggregate_verify/small",
    path.join(SPEC_TESTS_DIR, "tests/general/phase0/bls/fast_aggregate_verify/small"),
    (testCase: any) => {
      const {pubkeys, message, signature} = testCase.data.input;
      try {
        return bls.Signature.fromBytes(hexToBytes(signature)).verifyAggregate(
          pubkeys.map((hex: any) => bls.PublicKey.fromBytes(hexToBytes(hex), CoordType.jacobian, true)),
          hexToBytes(message)
        );
      } catch (e) {
        return false;
      }
    },
    {
      inputTypes: {data: InputType.YAML},
      getExpected: (testCase: any) => testCase.data.output,
    }
  );
});
