import {expect} from "chai";
import {IBls} from "../../../../src/types.js";
import type {PublicKey, Signature} from "../../../../src/types.js";
import {BlsMultiThreadNaive} from "./index.js";

export function runMultithreadTests(bls: IBls): void {
  describe("bls pool naive", function () {
    // Starting all threads may take a while due to ts-node compilation
    this.timeout(20 * 1000);

    const n = 16;
    let pool: BlsMultiThreadNaive;

    before("Create pool and warm-up wallets", async function () {
      pool = new BlsMultiThreadNaive(bls.implementation);
    });

    after("Destroy pool", async function () {
      await pool.destroy();
    });

    describe("1 msg, 1 pk", function () {
      const msg = Buffer.from("sample-msg");
      const sk = bls.SecretKey.fromKeygen();
      const pk = sk.toPublicKey();
      const sig = sk.sign(msg);

      it("verify", async function () {
        if (bls.implementation === "herumi") this.skip();

        const validArr = await Promise.all(
          Array.from({length: 32}, (i) => i).map(async () => pool.verify(pk, msg, sig))
        );
        for (const [i, valid] of validArr.entries()) {
          expect(valid).to.equal(true, `Invalid ${i}`);
        }
      });
    });

    describe("N msgs, N pks", function () {
      const sets: {publicKey: PublicKey; message: Uint8Array; signature: Signature}[] = [];
      for (let i = 0; i < n; i++) {
        const message = Buffer.alloc(32, i);
        const sk = bls.SecretKey.fromKeygen();
        sets.push({message, publicKey: sk.toPublicKey(), signature: sk.sign(message)});
      }

      it("verify", async function () {
        if (bls.implementation === "herumi") this.skip();

        const validArr = await Promise.all(sets.map((s) => pool.verify(s.publicKey, s.message, s.signature)));
        for (const [i, valid] of validArr.entries()) {
          expect(valid).to.equal(true, `Invalid ${i}`);
        }
      });

      it("verifyMultipleAggregateSignatures", async function () {
        if (bls.implementation === "herumi") this.skip();

        const valid = await pool.verifyMultipleAggregateSignatures(sets);
        expect(valid).to.equal(true);
      });
    });
  });
}
