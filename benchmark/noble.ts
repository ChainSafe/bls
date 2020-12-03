import {runBenchmark} from "./runner";
import {range, randomMessage} from "../test/util";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import * as noble from "noble-bls12-381";
import {aggCount, runsNoble} from "./params";

(async function () {
  // verify

  await runBenchmark<{pk: Uint8Array; msg: Uint8Array; sig: Uint8Array}, boolean>({
    id: `noble verify`,

    prepareTest: async () => {
      const priv = generateRandomSecretKey();
      const msg = randomMessage();
      const pk = noble.PointG1.fromPrivateKey(priv);
      const sig = noble.PointG2.fromSignature(await noble.sign(msg, priv));

      return {
        input: {pk, msg: await noble.PointG2.hashToCurve(msg), sig},
        resultCheck: (valid: boolean) => valid === true,
      };
    },
    testRunner: async ({pk, msg, sig}) => {
      return await noble.verify(sig, msg, pk);
    },
    runs: runsNoble,
  });

  // Fast aggregate

  await runBenchmark<{pks: Uint8Array[]; msg: Uint8Array; sig: Uint8Array}, boolean>({
    id: `noble verifyAggregate (${aggCount})`,

    prepareTest: async () => {
      const msg = randomMessage();
      const dataArr = await Promise.all(
        range(aggCount).map(async () => {
          const sk = generateRandomSecretKey();
          const pk = noble.PointG1.fromPrivateKey(sk);
          const sig = noble.PointG2.fromSignature(await noble.sign(msg, sk));
          return {pk, sig};
        })
      );

      const pks = dataArr.map((data) => data.pk);
      const sig = noble.aggregateSignatures(dataArr.map((data) => data.sig)) as unknown as noble.PointG2[];

      return {
        input: {pks, msg, sig},
        resultCheck: (valid: boolean) => valid === true,
      };
    },
    testRunner: async ({pks, msg, sig}) => {
      const pk = noble.aggregatePublicKeys(pks);
      return await noble.verify(sig, msg, pk);
    },
    runs: runsNoble,
  });

  // // Verify multiple

  await runBenchmark<{pks: Uint8Array[]; msgs: Uint8Array[]; sig: Uint8Array}, boolean>({
    id: `noble verifyMultiple (${aggCount})`,

    prepareTest: async () => {
      const dataArr = await Promise.all(
        range(aggCount).map(async () => {
          const sk = generateRandomSecretKey();
          const pk = noble.PointG1.fromPrivateKey(sk);
          const msg = randomMessage();
          const sig = noble.PointG2.fromSignature(await noble.sign(msg, sk));
          return {pk, msg: await noble.PointG2.hashToCurve(msg), sig};
        })
      );

      const pks = dataArr.map((data) => data.pk);
      const msgs = dataArr.map((data) => data.msg);
      const sig = noble.aggregateSignatures(dataArr.map((data) => data.sig));

      return {
        input: {pks, msgs, sig},
        resultCheck: (valid: boolean) => valid === true,
      };
    },
    testRunner: async ({pks, msgs, sig}) => {
      return await noble.verifyBatch(msgs, pks, sig);
    },
    runs: runsNoble,
  });

  // Aggregate pubkeys

  await runBenchmark<Uint8Array[], void>({
    id: `noble aggregate pubkeys (${aggCount})`,

    prepareTest: () => {
      return {
        input: range(aggCount).map(() => noble.PointG1.fromPrivateKey(generateRandomSecretKey())),
      };
    },
    testRunner: async (pks) => {
      noble.aggregatePublicKeys(pks);
    },
    runs: runsNoble,
  });

  await runBenchmark<Uint8Array[], void>({
    id: `noble aggregate sigs (${aggCount})`,

    prepareTest: async () => {
      return {
        input: await Promise.all(range(aggCount).map(() => noble.PointG2.hashToCurve(generateRandomSecretKey()))),
      };
    },
    testRunner: async (pks) => {
      noble.aggregatePublicKeys(pks);
    },
    runs: runsNoble,
  });
})();
