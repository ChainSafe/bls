import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {SecretKey} from "@chainsafe/blst-ts";
import {fromHexString, toHexString} from "../util";

interface ISignMessageTestCase {
  data: {
    input: {
      privkey: string;
      message: string;
    };
    output: string;
  };
}

describeDirectorySpecTest<ISignMessageTestCase, string>(
  "BLS - sign",
  path.join(__dirname, "../../node_modules/@chainsafe/eth2-spec-tests/tests/general/phase0/bls/sign/small"),
  (testCase) => {
    const {privkey, message} = testCase.data.input;

    const sk = SecretKey.fromBytes(fromHexString(privkey));
    const msg = fromHexString(message);
    const sig = sk.sign(msg);

    return toHexString(sig.toBytes());
  },
  {
    inputTypes: {
      data: InputType.YAML,
    },
    getExpected: (testCase) => testCase.data.output,
  }
);
