import path from "path";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {aggregateVerify, Signature, PublicKey} from "@chainsafe/blst-ts";
import {fromHexString} from "../util";

interface IAggregateSigsVerifyTestCase {
  data: {
    input: {
      pubkeys: string[];
      messages: string[];
      signature: string;
    };
    output: boolean;
  };
}

describeDirectorySpecTest<IAggregateSigsVerifyTestCase, boolean>(
  "BLS - aggregate sigs verify",
  path.join(__dirname, "../../node_modules/@chainsafe/eth2-spec-tests/tests/general/phase0/bls/aggregate_verify/small"),
  (testCase) => {
    const {pubkeys, messages, signature} = testCase.data.input;

    try {
      const msgs = messages.map(fromHexString);
      const pks = pubkeys.map((pubkey) => PublicKey.fromBytes(fromHexString(pubkey)));
      const sig = Signature.fromBytes(fromHexString(signature));

      return aggregateVerify(msgs, pks, sig);
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
