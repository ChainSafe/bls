import {runBenchmark} from "./runner.js";
import {range, randomMessage} from "../test/util.js";
import {generateRandomSecretKey} from "@chainsafe/bls-keygen";
import * as noble from "noble-bls12-381";
import {aggCount, runsNoble} from "./params.js";

(async function () {
  {
    // verify

    const priv = generateRandomSecretKey();
    const msg = randomMessage();
    const pk = noble.PointG1.fromPrivateKey(priv);
    const sig = noble.PointG2.fromSignature(await noble.sign(msg, priv));

    await runBenchmark<{pk: noble.PointG1; msg: noble.PointG2; sig: noble.PointG2}, boolean>({
      id: `noble verify`,
      prepareTest: async () => ({pk, msg: await noble.PointG2.hashToCurve(msg), sig}),
      testRunner: async ({pk, msg, sig}) => await noble.verify(sig, msg, pk),
      runs: runsNoble,
    });
  }

  {
    // Fast aggregate

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
    const sig = (noble.aggregateSignatures(dataArr.map((data) => data.sig)) as any) as noble.PointG2;

    await runBenchmark({
      id: `noble verifyAggregate (${aggCount})`,
      prepareTest: async () => ({pks, msg: await noble.PointG2.hashToCurve(msg), sig}),
      testRunner: async ({pks, msg, sig}) =>
        await noble.verify(sig, msg, (noble.aggregatePublicKeys(pks) as any) as noble.PointG1),
      runs: runsNoble,
    });
  }

  {
    // Verify multiple

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
    const sig = (noble.aggregateSignatures(dataArr.map((data) => data.sig)) as any) as noble.PointG2;

    await runBenchmark({
      id: `noble verifyMultiple (${aggCount})`,
      prepareTest: async () => ({pks, msgs, sig}),
      testRunner: async ({pks, msgs, sig}) => await noble.verifyBatch(msgs, pks, sig),
      runs: runsNoble,
    });
  }

  {
    // Aggregate pubkeys

    const pubkeys = range(aggCount).map(() => noble.PointG1.fromPrivateKey(generateRandomSecretKey()));

    await runBenchmark({
      id: `noble aggregate pubkeys (${aggCount})`,
      prepareTest: () => pubkeys,
      testRunner: async (pks) => noble.aggregatePublicKeys(pks),
      runs: runsNoble,
    });
  }

  const hashes = await Promise.all(
    range(aggCount)
      .map(() => generateRandomSecretKey())
      .map(noble.PointG2.hashToCurve)
  );

  await runBenchmark({
    id: `noble aggregate signatures (${aggCount})`,
    prepareTest: () => hashes,
    testRunner: async (sigs) => noble.aggregateSignatures(sigs),
    runs: runsNoble,
  });

  const sk = generateRandomSecretKey();
  const msg = await noble.PointG2.hashToCurve(randomMessage());

  await runBenchmark({
    id: `noble sign`,
    prepareTest: () => ({sk, msg}),
    testRunner: async ({sk, msg}) => await noble.sign(msg, sk),
    runs: runsNoble,
  });
})();
