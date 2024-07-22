import {expect} from "chai";
import {Buffer} from "buffer";
import {IBls} from "../../src/types.js";
import {getN, randomMessage} from "../util.js";
import {hexToBytes} from "../../src/helpers/index.js";
import {maliciousVerifyMultipleSignaturesData} from "../data/malicious-signature-test-data.js";

export function runIndexTests(bls: IBls): void {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function getRandomData() {
    const sk = bls.SecretKey.fromKeygen(randomMessage());
    const pk = sk.toPublicKey();
    const msg = randomMessage();
    const sig = sk.sign(msg);
    return {sk, pk, msg, sig};
  }

  describe("signature", () => {
    it("should fail loading an invalid signature point (not in G2)", () => {
      /* eslint-disable max-len */
      const POINT_NOT_IN_G2 = Buffer.from(
        "8123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "hex"
      );
      let sig;
      try {
        sig = bls.Signature.fromBytes(POINT_NOT_IN_G2, true);
      } catch {
        /* eslint-disable no-empty */
      }
      expect(sig === undefined).equals(true);
    });
  });

  describe("verify", () => {
    it("should verify signature", () => {
      const {pk, msg, sig} = getRandomData();
      const pkHex = pk.toHex();
      const isValid = bls.verify(pk.toBytes(), msg, sig.toBytes());
      expect(isValid, "fail verify").equals(true);

      // Make sure to not modify original pubkey when verifying
      expect(pk.toHex()).equals(pkHex, "pubkey modified when verifying");
    });

    it("should fail verify empty signature", () => {
      const {pk, msg} = getRandomData();
      const emptySig = Buffer.alloc(96);
      const isValid = bls.verify(pk.toBytes(), msg, emptySig);
      expect(isValid).equals(false);
    });

    it("should fail verify signature of different message", () => {
      const {pk, sig} = getRandomData();
      const msg2 = randomMessage();
      const isValid = bls.verify(pk.toBytes(), msg2, sig.toBytes());
      expect(isValid).equals(false);
    });

    it("should fail verify signature signed by different key", () => {
      const {msg, sig} = getRandomData();
      const {pk: pk2} = getRandomData();
      const isValid = bls.verify(pk2.toBytes(), msg, sig.toBytes());
      expect(isValid).equals(false);
    });

    it("should fail verify empty message", () => {
      const emptyMsg = new Uint8Array(0);
      const {pk, sig} = getRandomData();
      const isValid = sig.verify(pk, emptyMsg);
      expect(isValid).equals(false);
    });
  });

  describe("verify multiple", () => {
    it("should verify aggregated signatures", () => {
      const sks = getN(4, () => bls.SecretKey.fromKeygen(randomMessage()));
      const msgs = getN(2, () => randomMessage());
      const pks = sks.map((sk) => sk.toPublicKey());

      const sigs = [sks[0].sign(msgs[0]), sks[1].sign(msgs[0]), sks[2].sign(msgs[1]), sks[3].sign(msgs[1])];

      const aggPubkeys = [
        bls.aggregatePublicKeys([pks[0], pks[1]].map((pk) => pk.toBytes())),
        bls.aggregatePublicKeys([pks[2], pks[3]].map((pk) => pk.toBytes())),
      ];

      const aggSig = bls.aggregateSignatures(sigs.map((sig) => sig.toBytes()));

      expect(bls.verifyMultiple(aggPubkeys, msgs, aggSig), "should be valid").equals(true);
      expect(bls.verifyMultiple(aggPubkeys.reverse(), msgs, aggSig), "should fail - swaped pubkeys").equals(false);
    });

    it("should verify aggregated signatures - same message", () => {
      const n = 4;
      const msg = randomMessage();
      const sks = getN(n, () => bls.SecretKey.fromKeygen(randomMessage()));
      const pks = sks.map((sk) => sk.toPublicKey());
      const sigs = sks.map((sk) => sk.sign(msg));

      const aggregateSignature = bls.aggregateSignatures(sigs.map((sig) => sig.toBytes()));

      const isValid = bls.verifyMultiple(
        pks.map((pk) => pk.toBytes()),
        getN(4, () => msg), // Same message n times
        aggregateSignature
      );
      expect(isValid).equals(true);
    });

    it("should fail to verify aggregated signatures - no public keys", () => {
      const sig = Buffer.alloc(96);
      const msg1 = randomMessage();
      const msg2 = randomMessage();

      const isValid = bls.verifyMultiple([], [msg2, msg1], sig);
      expect(isValid).equals(false);
    });

    it("should fail verify empty message", () => {
      const sks = getN(2, () => bls.SecretKey.fromKeygen(randomMessage()));
      const msgs = getN(2, () => randomMessage());
      const pks = sks.map((sk) => sk.toPublicKey());
      const sigs = [sks[0].sign(msgs[0]), sks[1].sign(msgs[1])];
      const aggSig = bls.Signature.aggregate(sigs);

      const emptyMsgs = msgs.map(() => new Uint8Array(0));
      const isValid = aggSig.verifyMultiple(pks, emptyMsgs);
      expect(isValid).equals(false);
    });
  });

  describe("verifyMultipleSignatures", () => {
    it("Should verify multiple signatures", () => {
      const n = 4;
      const sets = getN(n, () => {
        const sk = bls.SecretKey.fromKeygen(randomMessage());
        const publicKey = sk.toPublicKey();
        const message = randomMessage();
        const signature = sk.sign(message);
        return {publicKey, message, signature};
      });

      expect(bls.Signature.verifyMultipleSignatures(sets)).to.equal(true, "class interface failed");

      expect(
        bls.verifyMultipleSignatures(
          sets.map((s) => ({
            publicKey: s.publicKey.toBytes(),
            message: s.message,
            signature: s.signature.toBytes(),
          }))
        )
      ).to.equal(true, "functional (bytes serialized) interface failed");
    });

    it("Test fails correctly against a malicous signature", async () => {
      const pks = maliciousVerifyMultipleSignaturesData.pks.map((pk) => bls.PublicKey.fromHex(pk));
      const msgs = maliciousVerifyMultipleSignaturesData.msgs.map(hexToBytes);
      const sigs = maliciousVerifyMultipleSignaturesData.sigs.map((sig) => bls.Signature.fromHex(sig));

      maliciousVerifyMultipleSignaturesData.manipulated.forEach((isManipulated, i) => {
        expect(sigs[i].verify(pks[i], msgs[i])).to.equal(
          !isManipulated,
          isManipulated ? "Manipulated signature should not verify" : "Ok signature should verify"
        );
      });

      // This method (AggregateVerify in BLS spec lingo) should verify

      const dangerousAggSig = bls.Signature.aggregate(sigs);
      expect(dangerousAggSig.verifyMultiple(pks, msgs)).to.equal(
        true,
        "Malicious signature should be validated with bls.verifyMultiple"
      );

      const maliciousSets = pks.map((_, i) => ({
        publicKey: pks[i],
        message: msgs[i],
        signature: sigs[i],
      }));

      // This method is expected to catch the malicious signature and not verify
      expect(bls.Signature.verifyMultipleSignatures(maliciousSets)).to.equal(
        false,
        "Malicous signature should not validate with bls.verifyMultipleSignatures"
      );
    });

    it("should fail verify empty message", () => {
      const n = 4;
      const sets = getN(n, (i) => {
        const sk = bls.SecretKey.fromKeygen(Buffer.alloc(32, i));
        const publicKey = sk.toPublicKey();
        const message = randomMessage();
        const signature = sk.sign(message);
        return {publicKey, message, signature};
      });

      const setsWithEmptyMsgs = sets.map((set) => ({...set, message: new Uint8Array(0)}));

      const isValid = bls.Signature.verifyMultipleSignatures(setsWithEmptyMsgs);
      expect(isValid).equals(false);
    });
  });

  describe("serialize deserialize", () => {
    /* eslint-disable max-len */

    const skHex = "0x0101010101010101010101010101010101010101010101010101010101010101";
    const pkHexCompExpected =
      "0xaa1a1c26055a329817a5759d877a2795f9499b97d6056edde0eea39512f24e8bc874b4471f0501127abb1ea0d9f68ac1";
    const pkHexUncompExpected =
      "0x0a1a1c26055a329817a5759d877a2795f9499b97d6056edde0eea39512f24e8bc874b4471f0501127abb1ea0d9f68ac111392125a1c3750363c2c97d9650fb78696e6428db8ff9efaf0471cbfd20324916ab545746db83756d335e92f9e8c8b8";

    it("Should serialize comp pubkey", () => {
      const sk = bls.SecretKey.fromBytes(hexToBytes(skHex));
      const pkHexComp = sk.toPublicKey().toHex();
      expect(pkHexComp).to.equal(pkHexCompExpected, "Wrong pkHexComp");
    });

    it("Should serialize uncomp pubkey", () => {
      const sk = bls.SecretKey.fromBytes(hexToBytes(skHex));
      const pkHexUncomp = sk.toPublicKey().toHex(false);
      expect(pkHexUncomp).to.equal(pkHexUncompExpected, "Wrong pkHexUncomp");
    });

    it("Should deserialize comp pubkey", () => {
      bls.PublicKey.fromHex(pkHexCompExpected);
    });

    it("Should deserialize uncomp pubkey", () => {
      bls.PublicKey.fromHex(pkHexUncompExpected);
    });
  });
}
