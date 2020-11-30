import {expect} from "chai";
import {SecretKey, PublicKey, Signature, init} from "../../src";

describe("index named exports", () => {
  it("Classes and methods should be defined", async () => {
    await init("herumi");

    const sk = SecretKey.fromKeygen();
    const msg = new Uint8Array(32);
    const sig = sk.sign(msg);
    const pk = sk.toPublicKey();
    expect(verifyHelper(pk, sig, msg)).to.be.true;
  });

  /**
   * Sample helper to test argument typing
   */
  function verifyHelper(pk: PublicKey, sig: Signature, msg: Uint8Array): boolean {
    return sig.verify(pk, msg);
  }
});
