import path from "path";
import {describeDirectorySpecTest, InputType} from "@lodestar/spec-test-util";
import {hexToBytes} from "../../src/helpers/index.js";
import {SPEC_TESTS_DIR} from "../params.js";
import {describeForAllImplementations} from "../switch.js";

interface IVerifyTestCase {
  data: {
    input: {
      pubkey: string;
      message: string;
      signature: string;
    };
    output: boolean;
  };
  meta?: undefined;
}

describeForAllImplementations((bls) => {
  describeDirectorySpecTest<IVerifyTestCase, boolean>(
    "bls/verify/small",
    path.join(SPEC_TESTS_DIR, "tests/general/phase0/bls/verify/small"),
    (testCase: any) => {
      const {pubkey, message, signature} = testCase.data.input;
      return bls.verify(hexToBytes(pubkey), hexToBytes(message), hexToBytes(signature));
    },
    {
      inputTypes: {data: InputType.YAML},
      getExpected: (testCase: any) => testCase.data.output,
    }
  );
});
