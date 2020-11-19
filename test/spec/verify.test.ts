import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {hexToBytes} from "../../src/helpers/utils";
import {SPEC_TESTS_DIR} from "../params";
import {forEachImplementation} from "../switch";

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

forEachImplementation((bls, implementation) => {
  describeDirectorySpecTest<IVerifyTestCase, boolean>(
    `${implementation} - bls/verify/small`,
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
