import {expect} from "chai";
import {IBls} from "../../src/interface";

export function runPrivateKeyTests(bls: IBls) {
  describe("PrivateKey", () => {
    it("should generate fromKeygen private key", () => {
      const privateKey1 = bls.PrivateKey.fromKeygen();
      const privateKey2 = bls.PrivateKey.fromKeygen();
      expect(privateKey1.toHex()).to.not.be.equal(privateKey2.toHex());
    });

    const privateKey = "0x07656fd676da43883d163f49566c72b9cbf0a5a294f26808c807700732456da7";

    it("should export private key to hex string", () => {
      expect(bls.PrivateKey.fromHex(privateKey).toHex()).to.be.equal(privateKey);
    });

    it("should export private key to hex string from non-prefixed hex", () => {
      expect(bls.PrivateKey.fromHex(privateKey.replace("0x", "")).toHex()).to.be.equal(privateKey);
    });

    it("should not accept too short private key", () => {
      expect(() => bls.PrivateKey.fromHex("0x2123")).to.throw();
    });
  });
}
