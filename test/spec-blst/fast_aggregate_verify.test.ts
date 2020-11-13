import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {fastAggregateVerify, Signature, PublicKey} from "@chainsafe/blst-ts";
import {fromHexString} from "../util";

interface IAggregateSigsVerifyTestCase {
  data: {
    input: {
      pubkeys: string[];
      message: string;
      signature: string;
    };
    output: boolean;
  };
}

describeDirectorySpecTest<IAggregateSigsVerifyTestCase, boolean>(
  "BLS - aggregate sigs verify",
  path.join(
    __dirname,
    "../../node_modules/@chainsafe/eth2-spec-tests/tests/general/phase0/bls/fast_aggregate_verify/small"
  ),
  (testCase) => {
    const {pubkeys, message, signature} = testCase.data.input;

    try {
      const msg = fromHexString(message);
      const pks = pubkeys.map((pubkey) => PublicKey.fromBytes(fromHexString(pubkey)));
      const sig = Signature.fromBytes(fromHexString(signature));

      return fastAggregateVerify(msg, pks, sig);
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
