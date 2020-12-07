import {runForAllImplementations} from "../test/switch";
import {range, randomMessage} from "../test/util";

(async function () {
  console.log("verifyMultipleSignatures savings");
  console.log(["Impl", "# sigs", "ratio multi/single"].join("\t"));

  await runForAllImplementations(async (bls, implementation) => {
    for (const aggCount of [2, 5, 10, 20, 50, 100]) {
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

      const startMulti = process.hrtime.bigint();
      bls.Signature.verifyMultipleSignatures(pks, msgs, sigs);
      const endMulti = process.hrtime.bigint();
      const diffMulti = endMulti - startMulti;

      const startSingle = process.hrtime.bigint();
      for (const {pk, msg, sig} of dataArr) {
        sig.verify(pk, msg);
      }
      const endSingle = process.hrtime.bigint();
      const diffSingle = endSingle - startSingle;

      const ratio = Number(diffMulti) / Number(diffSingle);
      console.log([implementation, aggCount, ratio.toPrecision(2)].join("\t"));
    }
  });
})();
