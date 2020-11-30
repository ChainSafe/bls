import {expect} from "chai";
import {IBls} from "../../src/interface";
import {getN, randomMessage} from "../util";

export function runIndexTests(bls: IBls): void {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function getRandomData() {
    const sk = bls.SecretKey.fromKeygen();
    const pk = sk.toPublicKey();
    const msg = randomMessage();
    const sig = sk.sign(msg);
    return {sk, pk, msg, sig};
  }

  describe("verify", () => {
    it("should verify signature", () => {
      const {pk, msg, sig} = getRandomData();
      const pkHex = pk.toHex();
      const isValid = bls.verify(pk.toBytes(), msg, sig.toBytes());
      expect(isValid, "fail verify").to.be.true;

      // Make sure to not modify original pubkey when verifying
      expect(pk.toHex()).to.be.equal(pkHex, "pubkey modified when verifying");
    });

    it("should fail verify empty signature", () => {
      const {pk, msg} = getRandomData();
      const emptySig = Buffer.alloc(96);
      const isValid = bls.verify(pk.toBytes(), msg, emptySig);
      expect(isValid).to.be.false;
    });

    it("should fail verify signature of different message", () => {
      const {pk, sig} = getRandomData();
      const msg2 = randomMessage();
      const isValid = bls.verify(pk.toBytes(), msg2, sig.toBytes());
      expect(isValid).to.be.false;
    });

    it("should fail verify signature signed by different key", () => {
      const {msg, sig} = getRandomData();
      const {pk: pk2} = getRandomData();
      const isValid = bls.verify(pk2.toBytes(), msg, sig.toBytes());
      expect(isValid).to.be.false;
    });
  });

  describe("verify multiple", () => {
    it("should verify aggregated signatures", () => {
      const sks = getN(4, () => bls.SecretKey.fromKeygen());
      const msgs = getN(2, () => randomMessage());
      const pks = sks.map((sk) => sk.toPublicKey());

      const sigs = [sks[0].sign(msgs[0]), sks[1].sign(msgs[0]), sks[2].sign(msgs[1]), sks[3].sign(msgs[1])];

      const aggPubkeys = [
        bls.aggregatePublicKeys([pks[0], pks[1]].map((pk) => pk.toBytes())),
        bls.aggregatePublicKeys([pks[2], pks[3]].map((pk) => pk.toBytes())),
      ];

      const aggSig = bls.aggregateSignatures(sigs.map((sig) => sig.toBytes()));

      expect(bls.verifyMultiple(aggPubkeys, msgs, aggSig), "should be valid").to.be.true;
      expect(bls.verifyMultiple(aggPubkeys.reverse(), msgs, aggSig), "should fail - swaped pubkeys").to.be.false;
    });

    it("should verify aggregated signatures - same message", () => {
      const n = 4;
      const msg = randomMessage();
      const sks = getN(n, () => bls.SecretKey.fromKeygen());
      const pks = sks.map((sk) => sk.toPublicKey());
      const sigs = sks.map((sk) => sk.sign(msg));

      const aggregateSignature = bls.aggregateSignatures(sigs.map((sig) => sig.toBytes()));

      const isValid = bls.verifyMultiple(
        pks.map((pk) => pk.toBytes()),
        getN(4, () => msg), // Same message n times
        aggregateSignature
      );
      expect(isValid).to.be.true;
    });

    it("should fail to verify aggregated signatures - no public keys", () => {
      const sig = Buffer.alloc(96);
      const msg1 = randomMessage();
      const msg2 = randomMessage();

      const isValid = bls.verifyMultiple([], [msg2, msg1], sig);
      expect(isValid).to.be.false;
    });
  });
}
