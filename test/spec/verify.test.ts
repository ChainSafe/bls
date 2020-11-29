import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {hexToBytes} from "../../src/helpers";
import {SPEC_TESTS_DIR} from "../params";
import {describeForAllImplementations} from "../switch";

interface IVerifyTestCase {
  data: {
    input: {
      pubkey: string;
      message: string;
      signature: string;
    };
    output: boolean;
  };
}

describeForAllImplementations((bls) => {
  describeDirectorySpecTest<IVerifyTestCase, boolean>(
    "bls/verify/small",
    path.join(SPEC_TESTS_DIR, "general/phase0/bls/verify/small"),
    (testCase) => {
      const {pubkey, message, signature} = testCase.data.input;
      return bls.verify(hexToBytes(pubkey), hexToBytes(message), hexToBytes(signature));
    },
    {
      inputTypes: {data: InputType.YAML},
      getExpected: (testCase) => testCase.data.output,
    }
  );
});
