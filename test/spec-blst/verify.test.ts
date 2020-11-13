import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {verify, Signature, PublicKey} from "@chainsafe/blst-ts";
import {fromHexString} from "../util";

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

describeDirectorySpecTest<IVerifyTestCase, boolean>(
  "BLS - verify",
  path.join(__dirname, "../../node_modules/@chainsafe/eth2-spec-tests/tests/general/phase0/bls/verify/small"),
  (testCase) => {
    const {pubkey, message, signature} = testCase.data.input;

    try {
      const msg = fromHexString(message);
      const pk = PublicKey.fromBytes(fromHexString(pubkey));
      const sig = Signature.fromBytes(fromHexString(signature));

      return verify(msg, pk, sig);
    } catch (e) {
      return false;
    }
  },
  {
    inputTypes: {
      data: InputType.YAML,
    },
    getExpected: (testCase) => testCase.data.output,
  }
);
