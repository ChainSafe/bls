import {expect} from "chai";
import {SecretKey, PublicKey, Signature, init, bls} from "../../src";

describe("index named exports", () => {
  it("Classes and methods should be defined", async () => {
    await init("herumi");

    /**
     * Sample helper to test argument typing
     */
    function verifyHelper(pk: PublicKey, sig: Signature, msg: Uint8Array): boolean {
      return sig.verify(pk, msg);
    }

    const sk = SecretKey.fromKeygen();
    const msg = new Uint8Array(32);
    const sig = sk.sign(msg);
    const pk = sk.toPublicKey();
    expect(verifyHelper(pk, sig, msg)).to.be.true;
  });

  it("Make sure exported classes are compatible with interface", () => {
    const sk: SecretKey = bls.SecretKey.fromKeygen();
    const pk: PublicKey = sk.toPublicKey();
    const sig: Signature = sk.sign(new Uint8Array(32));
    pk;
    sig;
  });
});
