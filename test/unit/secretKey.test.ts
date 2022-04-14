import {expect} from "chai";
import {IBls} from "../../src/types.js";

export function runSecretKeyTests(bls: IBls): void {
  describe("SecretKey", () => {
    it("should generate fromKeygen secret key", () => {
      const secretKey1 = bls.SecretKey.fromKeygen();
      const secretKey2 = bls.SecretKey.fromKeygen();
      expect(secretKey1.toHex()).to.not.be.equal(secretKey2.toHex());
    });

    const secretKey = "0x07656fd676da43883d163f49566c72b9cbf0a5a294f26808c807700732456da7";

    it("should export secret key to hex string", () => {
      expect(bls.SecretKey.fromHex(secretKey).toHex()).to.be.equal(secretKey);
    });

    it("should export secret key to hex string from non-prefixed hex", () => {
      expect(bls.SecretKey.fromHex(secretKey).toHex()).to.be.equal(secretKey);
    });

    it("should not accept too short secret key", () => {
      expect(() => bls.SecretKey.fromHex("0x2123")).to.throw();
    });
  });
}
