import {expect} from "chai";
import {IBls} from "../../src/types.js";

export function runPublicKeyTests(bls: IBls): void {
  describe("PublicKey", () => {
    const publicKey =
      "0xb6f21199594b56d77670564bf422cb331d5281ca2c1f9a45588a56881d8287ef8619efa6456d6cd2ef61306aa5b21311";

    it("should export public key to hex string", () => {
      expect(bls.PublicKey.fromHex(publicKey).toHex()).equals(publicKey);
    });

    it("should export public key to hex string from non-prefixed hex", () => {
      expect(bls.PublicKey.fromHex(publicKey).toHex()).equals(publicKey);
    });

    it("from secret key", () => {
      bls.SecretKey.fromKeygen(Buffer.alloc(32)).toPublicKey();
    });
  });
}
