import {runBenchmark} from "./runner";
import {runForAllImplementations} from "../switch";
import {IPublicKey, ISignature} from "../../src/interface";
import {randomBytes} from "../../src/helpers";

runForAllImplementations(async (bls, implementation) => {
  await bls.init();

  const aggCount = 30;

  // verify

  runBenchmark<{pk: IPublicKey; msg: Uint8Array; sig: ISignature}, boolean>({
    id: `${implementation} verify`,

    prepareTest: () => {
      const msg = randomMsg();
      const sk = bls.PrivateKey.fromKeygen();
      const pk = sk.toPublicKey();
      const sig = sk.sign(msg);
      return {
        input: {pk, msg, sig},
        resultCheck: (valid) => valid === true,
      };
    },
    testRunner: ({pk, msg, sig}) => {
      return sig.verify(pk, msg);
    },
  });

  // Fast aggregate

  runBenchmark<{pks: IPublicKey[]; msg: Uint8Array; sig: ISignature}, boolean>({
    id: `${implementation} verifyAggregate`,

    prepareTest: () => {
      const msg = randomMsg();
      const dataArr = range(aggCount).map(() => {
        const sk = bls.PrivateKey.fromKeygen();
        const pk = sk.toPublicKey();
        const sig = sk.sign(msg);
        return {pk, sig};
      });

      const pks = dataArr.map((data) => data.pk);
      const sig = bls.Signature.aggregate(dataArr.map((data) => data.sig));

      return {
        input: {pks, msg, sig},
        resultCheck: (valid) => valid === true,
      };
    },
    testRunner: ({pks, msg, sig}) => {
      return sig.verifyAggregate(pks, msg);
    },
  });

  // Aggregate pubkeys

  runBenchmark<IPublicKey[], void>({
    id: `${implementation} aggregate pubkeys (${aggCount})`,

    prepareTest: () => {
      return {
        input: range(aggCount).map(() => bls.PrivateKey.fromKeygen().toPublicKey()),
      };
    },
    testRunner: (pks) => {
      bls.PublicKey.aggregate(pks);
    },
  });

  // Aggregate sigs

  runBenchmark<ISignature[], void>({
    id: `${implementation} aggregate signatures (${aggCount})`,

    prepareTest: () => {
      const msg = randomMsg();
      const sigs = range(aggCount).map(() => {
        const sk = bls.PrivateKey.fromKeygen();
        return sk.sign(msg);
      });
      return {
        input: sigs,
      };
    },
    testRunner: (sigs) => {
      bls.Signature.aggregate(sigs);
    },
  });
});

function range(n: number): number[] {
  const nums: number[] = [];
  for (let i = 0; i < n; i++) nums.push(i);
  return nums;
}

function randomMsg(): Uint8Array {
  return randomBytes(32);
}
