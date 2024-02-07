import path from "path";
import {describeDirectorySpecTest, InputType} from "@lodestar/spec-test-util";
import {bytesToHex, hexToBytes} from "../../src/helpers/index.js";
import {SPEC_TESTS_DIR} from "../params.js";
import {describeForAllImplementations} from "../switch.js";
import {ZeroSecretKeyError} from "../../src/errors.js";

interface ISignMessageTestCase {
  data: {
    input: {
      privkey: string;
      message: string;
    };
    output: string;
  };
  meta?: undefined;
}

describeForAllImplementations((bls) => {
  describeDirectorySpecTest<ISignMessageTestCase, string | null>(
    "bls/sign/small",
    path.join(SPEC_TESTS_DIR, "tests/general/phase0/bls/sign/small"),
    (testCase) => {
      try {
        const {privkey, message} = testCase.data.input;
        const signature = bls.sign(hexToBytes(privkey), hexToBytes(message));
        return bytesToHex(signature);
      } catch (e) {
        if (e instanceof ZeroSecretKeyError) return null;
        else throw e;
      }
    },
    {
      inputTypes: {data: InputType.YAML},
      getExpected: (testCase) => testCase.data.output,
    }
  );
});
