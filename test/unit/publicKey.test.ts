import {expect} from "chai";
import {IBls} from "../../src/interface";

export function runPublicKeyTests(bls: IBls) {
  describe("PublicKey", () => {
    const publicKey =
      "0xb6f21199594b56d77670564bf422cb331d5281ca2c1f9a45588a56881d8287ef8619efa6456d6cd2ef61306aa5b21311";

    it("should export public key to hex string", () => {
      expect(bls.PublicKey.fromHex(publicKey).toHex()).to.be.equal(publicKey);
    });

    it("should export public key to hex string from non-prefixed hex", () => {
      expect(bls.PublicKey.fromHex(publicKey.replace("0x", "")).toHex()).to.be.equal(publicKey);
    });

    it("from private key", () => {
      bls.PrivateKey.fromKeygen().toPublicKey();
    });
  });
}
