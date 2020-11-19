import crypto from "crypto";
import * as blst from "@chainsafe/blst-ts";
import {blst as blstBindings} from "@chainsafe/blst-ts/dist/bindings";
import * as herumi from "../../src";
import {runBenchmark} from "./runner";

(async function () {
  await herumi.initBLS();

  const aggCount = 30;

  // verify

  runBenchmark<{pk: blst.PublicKey; msg: Uint8Array; sig: blst.Signature}, boolean>({
    id: "BLST verify",

    prepareTest: () => {
      const msg = randomMsg();
      const sk = blst.SecretKey.fromKeygen(crypto.randomBytes(32));
      const pk = sk.toPublicKey();
      const sig = sk.sign(msg);
      return {
        input: {pk, msg, sig},
        resultCheck: (valid) => valid === true,
      };
    },
    testRunner: ({pk, msg, sig}) => {
      return blst.verify(msg, pk, sig);
    },
  });

  runBenchmark<{pk: herumi.PublicKey; msg: Uint8Array; sig: herumi.Signature}, boolean>({
    id: "HERUMI verify",

    prepareTest: () => {
      const msg = randomMsg();
      const keypair = herumi.generateKeyPair();
      const pk = keypair.publicKey;
      const sig = keypair.privateKey.signMessage(msg);
      return {
        input: {pk, msg, sig},
        resultCheck: (valid) => valid === true,
      };
    },
    testRunner: ({pk, msg, sig}) => {
      return pk.verifyMessage(sig, msg);
    },
  });

  // Fast aggregate

  runBenchmark<{pks: blst.PublicKey[]; msg: Uint8Array; sig: blst.Signature}, boolean>({
    id: "BLST fastAggregateVerify",

    prepareTest: () => {
      const msg = randomMsg();

      const dataArr = range(aggCount).map(() => {
        const sk = blst.SecretKey.fromKeygen(crypto.randomBytes(32));
        const pk = sk.toPublicKey();
        const sig = sk.sign(msg);
        return {pk, sig};
      });

      const pks = dataArr.map((data) => data.pk);
      const aggSig = blst.AggregateSignature.fromSignatures(dataArr.map((data) => data.sig));
      const sig = aggSig.toSignature();

      return {
        input: {pks, msg, sig},
        resultCheck: (valid) => valid === true,
      };
    },
    testRunner: ({pks, msg, sig}) => {
      return blst.fastAggregateVerify(msg, pks, sig);
    },
  });

  runBenchmark<{pks: herumi.PublicKey[]; msg: Uint8Array; sig: herumi.Signature}, boolean>({
    id: "HERUMI fastAggregateVerify",

    prepareTest: () => {
      const msg = randomMsg();

      const dataArr = range(aggCount).map(() => {
        const keypair = herumi.generateKeyPair();
        const pk = keypair.publicKey;
        const sig = keypair.privateKey.signMessage(msg);
        return {pk, sig};
      });

      const pks = dataArr.map((data) => data.pk);
      const sig = herumi.Signature.aggregate(dataArr.map((data) => data.sig));

      return {
        input: {pks, msg, sig},
        resultCheck: (valid) => valid === true,
      };
    },
    testRunner: ({pks, msg, sig}) => {
      return sig.verifyAggregate(pks, msg);
    },
  });

  // Aggregate sigs

  runBenchmark<blst.PublicKey[], void>({
    id: `BLST aggregatePubkeys (${aggCount})`,

    prepareTest: () => {
      return {
        input: range(aggCount).map(() => blst.SecretKey.fromKeygen(crypto.randomBytes(32)).toPublicKey()),
      };
    },
    testRunner: (pks) => {
      blst.AggregatePublicKey.fromPublicKeys(pks);
    },
  });

  runBenchmark<blst.AggregatePublicKey[], void>({
    id: `BLST aggregatePubkeys as jacobian (${aggCount})`,

    prepareTest: () => {
      return {
        input: range(aggCount).map(() => {
          const pk = blst.SecretKey.fromKeygen(crypto.randomBytes(32)).toPublicKey();
          return blst.AggregatePublicKey.fromPublicKey(pk);
        }),
      };
    },
    testRunner: (pks) => {
      const p1Arr = pks.map((pk) => pk.value);
      p1Arr.reduce((agg, pk) => {
        return blstBindings.P1.add(agg, pk);
      });
    },
  });

  runBenchmark<herumi.PublicKey[], void>({
    id: `HERUMI aggregatePubkeys (${aggCount})`,

    prepareTest: () => {
      return {
        input: range(aggCount).map(() => herumi.generateKeyPair().publicKey),
      };
    },
    testRunner: (pks) => {
      herumi.PublicKey.aggregate(pks);
    },
  });
})();

function range(n: number): number[] {
  const nums: number[] = [];
  for (let i = 0; i < n; i++) nums.push(i);
  return nums;
}

function randomMsg(): Uint8Array {
  return Uint8Array.from(crypto.randomBytes(32));
}
