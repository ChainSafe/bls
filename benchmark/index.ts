import {runBenchmark} from "./runner.js";
import {runForAllImplementations} from "../test/switch.js";
import {PublicKey, Signature} from "../src/interface.js";
import {aggCount} from "./params.js";

(async function () {
  await runForAllImplementations(async (bls, implementation) => {
    const msgSame = Buffer.alloc(32, 255);
    const sameMessage: {pk: PublicKey; msg: Uint8Array; sig: Signature}[] = [];
    const diffMessage: {pk: PublicKey; msg: Uint8Array; sig: Signature}[] = [];

    for (let i = 0; i < aggCount; i++) {
      const msg = Buffer.alloc(32, i + 1);
      const sk = bls.SecretKey.fromBytes(Buffer.alloc(32, i + 1));
      const pk = sk.toPublicKey();
      sameMessage.push({pk, msg: msgSame, sig: sk.sign(msgSame)});
      diffMessage.push({pk, msg, sig: sk.sign(msg)});
    }
    const {pk, msg, sig} = diffMessage[0];
    const sameMessageSig = bls.Signature.aggregate(sameMessage.map((s) => s.sig));
    const diffMessageSig = bls.Signature.aggregate(diffMessage.map((s) => s.sig));

    // verify

    await runBenchmark({
      id: `${implementation} verify`,
      prepareTest: () => ({pk, msg, sig}),
      testRunner: ({pk, msg, sig}) => sig.verify(pk, msg),
    });

    // Fast aggregate

    await runBenchmark({
      id: `${implementation} verifyAggregate (${aggCount})`,
      prepareTest: () => ({pks: sameMessage.map((s) => s.pk), msg: msgSame, sig: sameMessageSig}),
      testRunner: ({pks, msg, sig}) => sig.verifyAggregate(pks, msg),
    });

    // Verify multiple

    await runBenchmark({
      id: `${implementation} verifyMultiple (${aggCount})`,
      prepareTest: () => ({
        pks: diffMessage.map((s) => s.pk),
        msgs: diffMessage.map((s) => s.msg),
        sig: diffMessageSig,
      }),
      testRunner: ({pks, msgs, sig}) => sig.verifyMultiple(pks, msgs),
    });

    // Verify multiple signatures

    await runBenchmark({
      id: `${implementation} verifyMultipleSignatures (${aggCount})`,
      prepareTest: () => diffMessage,
      testRunner: (sets) =>
        bls.Signature.verifyMultipleSignatures(sets.map((s) => ({publicKey: s.pk, message: s.msg, signature: s.sig}))),
    });

    // Aggregate pubkeys

    await runBenchmark({
      id: `${implementation} aggregate pubkeys (${aggCount})`,
      prepareTest: () => diffMessage.map((s) => s.pk),
      testRunner: (pks) => bls.PublicKey.aggregate(pks),
    });

    // Aggregate sigs

    await runBenchmark({
      id: `${implementation} aggregate signatures (${aggCount})`,
      prepareTest: () => diffMessage.map((s) => s.sig),
      testRunner: (sigs) => bls.Signature.aggregate(sigs),
    });

    // Sign

    await runBenchmark({
      id: `${implementation} sign`,
      prepareTest: () => ({sk: bls.SecretKey.fromKeygen(), msg: msgSame}),
      testRunner: ({sk, msg}) => sk.sign(msg),
    });
  });
})();
