import {runBenchmark} from "./runner";
import {runForAllImplementations} from "../switch";
import {PublicKey, Signature} from "../../src/interface";
import {range, randomMessage} from "../util";

const aggCount = 30;

(async function () {
  await runForAllImplementations(async (bls, implementation) => {
    // verify

    await runBenchmark<{pk: PublicKey; msg: Uint8Array; sig: Signature}, boolean>({
      id: `${implementation} verify`,

      prepareTest: () => {
        const msg = randomMessage();
        const sk = bls.SecretKey.fromKeygen();
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

    await runBenchmark<{pks: PublicKey[]; msg: Uint8Array; sig: Signature}, boolean>({
      id: `${implementation} verifyAggregate`,

      prepareTest: () => {
        const msg = randomMessage();
        const dataArr = range(aggCount).map(() => {
          const sk = bls.SecretKey.fromKeygen();
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

    await runBenchmark<PublicKey[], void>({
      id: `${implementation} aggregate pubkeys (${aggCount})`,

      prepareTest: () => {
        return {
          input: range(aggCount).map(() => bls.SecretKey.fromKeygen().toPublicKey()),
        };
      },
      testRunner: (pks) => {
        bls.PublicKey.aggregate(pks);
      },
    });

    // Aggregate sigs

    await runBenchmark<Signature[], void>({
      id: `${implementation} aggregate signatures (${aggCount})`,

      prepareTest: () => {
        const msg = randomMessage();
        const sigs = range(aggCount).map(() => {
          const sk = bls.SecretKey.fromKeygen();
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
})();
