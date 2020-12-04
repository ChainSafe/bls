import {runBenchmark} from "./runner";
import {range, randomMessage} from "../test/util";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import * as noble from "noble-bls12-381";
import {aggCount, runsNoble} from "./params";

(async function () {
  // verify

  await runBenchmark<{pk: noble.PointG1; msg: noble.PointG2; sig: noble.PointG2}, boolean>({
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

  await runBenchmark<{pks: noble.PointG1[]; msg: noble.PointG2; sig: noble.PointG2}, boolean>({
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
      const sig = noble.aggregateSignatures(dataArr.map((data) => data.sig)) as any as noble.PointG2;

      return {
        input: {pks, msg: await noble.PointG2.hashToCurve(msg), sig},
        resultCheck: (valid: boolean) => valid === true,
      };
    },
    testRunner: async ({pks, msg, sig}) => {
      const pk = noble.aggregatePublicKeys(pks) as any as noble.PointG1;
      return await noble.verify(sig, msg, pk);
    },
    runs: runsNoble,
  });

  // // Verify multiple

  await runBenchmark<{pks: noble.PointG1[]; msgs: noble.PointG2[]; sig: noble.PointG2}, boolean>({
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
      const sig = noble.aggregateSignatures(dataArr.map((data) => data.sig)) as any as noble.PointG2;

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

  await runBenchmark<noble.PointG1[], void>({
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

  await runBenchmark<noble.PointG2[], void>({
    id: `noble aggregate signatures (${aggCount})`,

    prepareTest: async () => {
      const hashes = range(aggCount).map(() => generateRandomSecretKey()).map(noble.PointG2.hashToCurve);
      return {
        input: await Promise.all(hashes),
      };
    },
    testRunner: async (sigs) => {
      noble.aggregateSignatures(sigs);
    },
    runs: runsNoble,
  });

  await runBenchmark<{sk: Uint8Array; msg: noble.PointG2}, void>({
    id: `noble sign`,

    prepareTest: async () => ({
      input: {
        sk: generateRandomSecretKey(),
        msg: await noble.PointG2.hashToCurve(randomMessage()),
      },
    }),
    testRunner: async ({sk, msg}) => {
      await noble.sign(msg, sk);
    },
    runs: runsNoble,
  });
})();
