import {runBenchmark} from "./runner";
import {runForAllImplementations} from "../test/switch";
import {PublicKey, Signature, SecretKey} from "../src/interface";
import {range, randomMessage} from "../test/util";
import {aggCount, runs} from "./params";

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
      runs,
    });

    // Fast aggregate

    await runBenchmark<{pks: PublicKey[]; msg: Uint8Array; sig: Signature}, boolean>({
      id: `${implementation} verifyAggregate (${aggCount})`,

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
      runs,
    });

    // Verify multiple

    await runBenchmark<{pks: PublicKey[]; msgs: Uint8Array[]; sig: Signature}, boolean>({
      id: `${implementation} verifyMultiple (${aggCount})`,

      prepareTest: () => {
        const dataArr = range(aggCount).map(() => {
          const sk = bls.SecretKey.fromKeygen();
          const pk = sk.toPublicKey();
          const msg = randomMessage();
          const sig = sk.sign(msg);
          return {pk, msg, sig};
        });

        const pks = dataArr.map((data) => data.pk);
        const msgs = dataArr.map((data) => data.msg);
        const sig = bls.Signature.aggregate(dataArr.map((data) => data.sig));

        return {
          input: {pks, msgs, sig},
          resultCheck: (valid) => valid === true,
        };
      },
      testRunner: ({pks, msgs, sig}) => {
        return sig.verifyMultiple(pks, msgs);
      },
      runs,
    });

    // Verify multiple signatures

    await runBenchmark<{pks: PublicKey[]; msgs: Uint8Array[]; sigs: Signature[]}, boolean>({
      id: `${implementation} verifyMultipleSignatures (${aggCount})`,

      prepareTest: () => {
        const dataArr = range(aggCount).map(() => {
          const sk = bls.SecretKey.fromKeygen();
          const pk = sk.toPublicKey();
          const msg = randomMessage();
          const sig = sk.sign(msg);
          return {pk, msg, sig};
        });

        const pks = dataArr.map((data) => data.pk);
        const msgs = dataArr.map((data) => data.msg);
        const sigs = dataArr.map((data) => data.sig);

        return {
          input: {pks, msgs, sigs},
          resultCheck: (valid) => valid === true,
        };
      },
      testRunner: ({pks, msgs, sigs}) => {
        return bls.Signature.verifyMultipleSignatures(pks, msgs, sigs);
      },
      runs,
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
      runs,
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
      runs,
    });

    // Sign

    await runBenchmark<{sk: SecretKey; msg: Uint8Array}, void>({
      id: `${implementation} sign`,

      prepareTest: () => ({
        input: {
          sk: bls.SecretKey.fromKeygen(),
          msg: randomMessage(),
        },
      }),
      testRunner: ({sk, msg}) => {
        sk.sign(msg);
      },
      runs,
    });
  });
})();
