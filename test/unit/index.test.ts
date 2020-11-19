import bls, {aggregatePubkeys, aggregateSignatures, initBLS, Keypair, verify, verifyMultiple} from "../../src";
import SHA256 from "@chainsafe/as-sha256";
import {expect} from "chai";
import {destroy} from "../../src/context";

describe("test bls", function () {
  before(async function () {
    await initBLS();
  });

  after(function () {
    destroy();
  });

  describe("aggregate pubkey", function () {
    it("should aggregate empty array", function () {
      expect(bls.aggregatePubkeys([])).to.not.throw;
    });
  });

  describe("verify", function () {
    it("should verify signature", () => {
      const keypair = Keypair.generate();
      const messageHash = Buffer.from(SHA256.digest(Buffer.from("Test")));
      const signature = keypair.privateKey.signMessage(messageHash);
      const result = verify(keypair.publicKey.toBytes(), messageHash, signature.toBytes());
      expect(result).to.be.true;
    });

    it("should not modify original pubkey when verifying", () => {
      const keypair = Keypair.generate();
      const messageHash = Buffer.from(SHA256.digest(Buffer.from("Test")));
      const signature = keypair.privateKey.signMessage(messageHash);
      const pubKey = keypair.publicKey.toBytes();
      verify(pubKey, messageHash, signature.toBytes());
      expect("0x" + pubKey.toString("hex")).to.be.equal(keypair.publicKey.toHex());
    });

    it("should fail verify empty signature", () => {
      const keypair = Keypair.generate();
      const messageHash2 = Buffer.from(SHA256.digest(Buffer.from("Test message2")));
      const signature = Buffer.alloc(96);
      const result = verify(keypair.publicKey.toBytes(), messageHash2, signature);
      expect(result).to.be.false;
    });

    it("should fail verify signature of different message", () => {
      const keypair = Keypair.generate();
      const messageHash = Buffer.from(SHA256.digest(Buffer.from("Test message")));
      const messageHash2 = Buffer.from(SHA256.digest(Buffer.from("Test message2")));
      const signature = keypair.privateKey.signMessage(messageHash);
      const result = verify(keypair.publicKey.toBytes(), messageHash2, signature.toBytes());
      expect(result).to.be.false;
    });

    it("should fail verify signature signed by different key", () => {
      const keypair = Keypair.generate();
      const keypair2 = Keypair.generate();
      const messageHash = Buffer.from(SHA256.digest(Buffer.from("Test message")));
      const signature = keypair.privateKey.signMessage(messageHash);
      const result = verify(keypair2.publicKey.toBytes(), messageHash, signature.toBytes());
      expect(result).to.be.false;
    });
  });

  describe("verify multiple", function () {
    it("should verify aggregated signatures", function () {
      this.timeout(5000);

      const keypair1 = Keypair.generate();
      const keypair2 = Keypair.generate();
      const keypair3 = Keypair.generate();
      const keypair4 = Keypair.generate();

      const message1 = Buffer.from(SHA256.digest(Buffer.from("Test1")));
      const message2 = Buffer.from(SHA256.digest(Buffer.from("Test2")));

      const signature1 = keypair1.privateKey.signMessage(message1);
      const signature2 = keypair2.privateKey.signMessage(message1);
      const signature3 = keypair3.privateKey.signMessage(message2);
      const signature4 = keypair4.privateKey.signMessage(message2);

      const aggregatePubKey12 = aggregatePubkeys([keypair1.publicKey.toBytes(), keypair2.publicKey.toBytes()]);

      const aggregatePubKey34 = aggregatePubkeys([keypair3.publicKey.toBytes(), keypair4.publicKey.toBytes()]);

      const aggregateSignature = aggregateSignatures([
        signature1.toBytes(),
        signature2.toBytes(),
        signature3.toBytes(),
        signature4.toBytes(),
      ]);

      const result = verifyMultiple([aggregatePubKey12, aggregatePubKey34], [message1, message2], aggregateSignature);

      expect(result).to.be.true;
    });

    it("should verify aggregated signatures - same message", function () {
      this.timeout(5000);

      const keypair1 = Keypair.generate();
      const keypair2 = Keypair.generate();
      const keypair3 = Keypair.generate();
      const keypair4 = Keypair.generate();

      const message = Buffer.from(SHA256.digest(Buffer.from("Test1")));

      const signature1 = keypair1.privateKey.signMessage(message);
      const signature2 = keypair2.privateKey.signMessage(message);
      const signature3 = keypair3.privateKey.signMessage(message);
      const signature4 = keypair4.privateKey.signMessage(message);

      const aggregateSignature = aggregateSignatures([
        signature1.toBytes(),
        signature2.toBytes(),
        signature3.toBytes(),
        signature4.toBytes(),
      ]);

      const result = verifyMultiple(
        [
          keypair1.publicKey.toBytes(),
          keypair2.publicKey.toBytes(),
          keypair3.publicKey.toBytes(),
          keypair4.publicKey.toBytes(),
        ],
        [message, message, message, message],
        aggregateSignature
      );

      expect(result).to.be.true;
    });

    it("should fail to verify aggregated signatures - swapped messages", function () {
      this.timeout(5000);

      const keypair1 = Keypair.generate();
      const keypair2 = Keypair.generate();
      const keypair3 = Keypair.generate();
      const keypair4 = Keypair.generate();

      const message1 = Buffer.from(SHA256.digest(Buffer.from("Test1")));
      const message2 = Buffer.from(SHA256.digest(Buffer.from("Test2")));

      const signature1 = keypair1.privateKey.signMessage(message1);
      const signature2 = keypair2.privateKey.signMessage(message1);
      const signature3 = keypair3.privateKey.signMessage(message2);
      const signature4 = keypair4.privateKey.signMessage(message2);

      const aggregatePubKey12 = bls.aggregatePubkeys([keypair1.publicKey.toBytes(), keypair2.publicKey.toBytes()]);

      const aggregatePubKey34 = bls.aggregatePubkeys([keypair3.publicKey.toBytes(), keypair4.publicKey.toBytes()]);

      const aggregateSignature = bls.aggregateSignatures([
        signature1.toBytes(),
        signature2.toBytes(),
        signature3.toBytes(),
        signature4.toBytes(),
      ]);

      const result = bls.verifyMultiple(
        [aggregatePubKey12, aggregatePubKey34],
        [message2, message1],
        aggregateSignature
      );

      expect(result).to.be.false;
    });

    it("should fail to verify aggregated signatures - different pubkeys and messsages", () => {
      const keypair1 = Keypair.generate();
      const keypair2 = Keypair.generate();
      const keypair3 = Keypair.generate();
      const keypair4 = Keypair.generate();

      const message1 = Buffer.from(SHA256.digest(Buffer.from("Test1")));
      const message2 = Buffer.from(SHA256.digest(Buffer.from("Test2")));

      const signature1 = keypair1.privateKey.signMessage(message1);
      const signature2 = keypair2.privateKey.signMessage(message1);
      const signature3 = keypair3.privateKey.signMessage(message2);
      const signature4 = keypair4.privateKey.signMessage(message2);

      const aggregatePubKey12 = bls.aggregatePubkeys([keypair1.publicKey.toBytes(), keypair2.publicKey.toBytes()]);

      const aggregateSignature = bls.aggregateSignatures([
        signature1.toBytes(),
        signature2.toBytes(),
        signature3.toBytes(),
        signature4.toBytes(),
      ]);

      const result = bls.verifyMultiple([aggregatePubKey12], [message2, message1], aggregateSignature);

      expect(result).to.be.false;
    });

    it("should fail to verify aggregated signatures - no public keys", () => {
      const signature = Buffer.alloc(96);

      const message1 = Buffer.from(SHA256.digest(Buffer.from("Test1")));
      const message2 = Buffer.from(SHA256.digest(Buffer.from("Test2")));

      const result = bls.verifyMultiple([], [message2, message1], signature);

      expect(result).to.be.false;
    });
  });
});
