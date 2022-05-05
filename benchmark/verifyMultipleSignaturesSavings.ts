import {runForAllImplementations} from "../test/switch.js";
import {range, randomMessage} from "../test/util.js";

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
        return {publicKey: pk, message: msg, signature: sig};
      });

      const startMulti = process.hrtime.bigint();
      bls.Signature.verifyMultipleSignatures(dataArr);
      const endMulti = process.hrtime.bigint();
      const diffMulti = endMulti - startMulti;

      const startSingle = process.hrtime.bigint();
      for (const {publicKey, message, signature} of dataArr) {
        signature.verify(publicKey, message);
      }
      const endSingle = process.hrtime.bigint();
      const diffSingle = endSingle - startSingle;

      const ratio = Number(diffMulti) / Number(diffSingle);
      console.log([implementation, aggCount, ratio.toPrecision(2)].join("\t"));
    }
  });
})();
