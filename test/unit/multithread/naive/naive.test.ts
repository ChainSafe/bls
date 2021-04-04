import {expect} from "chai";
import {IBls, PublicKey, Signature} from "../../../../src";
import {BlsMultiThreadNaive} from "./index";
import {warmUpWorkers} from "./utils";

export function runMultithreadTests(bls: IBls): void {
  describe("bls pool naive", function () {
    const nodeJsSemver = process.versions.node;
    const nodeJsMajorVer = parseInt(nodeJsSemver.split(".")[0]);
    if (!nodeJsMajorVer) {
      throw Error(`Error parsing NodeJS version: ${nodeJsSemver}`);
    }
    if (nodeJsMajorVer < 12) {
      return; // Skip everything
    }

    const n = 16;
    let pool: BlsMultiThreadNaive;

    before("Create pool and warm-up wallets", async function () {
      // Starting all threads may take a while due to ts-node compilation
      this.timeout(20 * 1000);
      pool = new BlsMultiThreadNaive(bls.implementation);
      await warmUpWorkers(bls, pool);
    });

    after("Destroy pool", async function () {
      this.timeout(20 * 1000);
      await pool.destroy();
    });

    describe("1 msg, 1 pk", () => {
      const msg = Buffer.from("sample-msg");
      const sk = bls.SecretKey.fromKeygen(Buffer.alloc(32, 1));
      const pk = sk.toPublicKey();
      const sig = sk.sign(msg);

      it("verify", async () => {
        const valid = await pool.verify(pk, msg, sig);
        expect(valid).to.equal(true);
      });
    });

    describe("N msgs, N pks", () => {
      const sets: {publicKey: PublicKey; message: Uint8Array; signature: Signature}[] = [];
      for (let i = 0; i < n; i++) {
        const message = Buffer.alloc(32, i);
        const sk = bls.SecretKey.fromKeygen(Buffer.alloc(32, i));
        sets.push({message, publicKey: sk.toPublicKey(), signature: sk.sign(message)});
      }

      it("verify", async () => {
        const validArr = await Promise.all(sets.map((s) => pool.verify(s.publicKey, s.message, s.signature)));
        for (const [i, valid] of validArr.entries()) {
          expect(valid).to.equal(true, `Invalid ${i}`);
        }
      });

      it("verifyMultipleAggregateSignatures", async () => {
        const valid = await pool.verifyMultipleAggregateSignatures(sets);
        expect(valid).to.equal(true);
      });
    });
  });
}
