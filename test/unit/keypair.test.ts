import {PrivateKey, PublicKey, Keypair, destroy, initBLS} from "../../src";
import {expect} from "chai";

describe("keypair", function () {
  before(async function () {
    await initBLS();
  });

  after(function () {
    destroy();
  });

  it("should create from private and public key", () => {
    const secret = PrivateKey.fromKeygen();
    const secret2 = PrivateKey.fromKeygen();
    const publicKey = PublicKey.fromBytes(secret2.toPublicKey().toBytes());
    const keypair = new Keypair(secret, publicKey);
    expect(keypair.publicKey).to.be.equal(publicKey);
    expect(keypair.privateKey).to.be.equal(secret);
    expect(keypair.privateKey).to.not.be.equal(secret2);
  });

  it("should create from private", () => {
    const secret = PrivateKey.fromKeygen();
    const publicKey = secret.toPublicKey();
    const keypair = new Keypair(secret);
    expect(keypair.publicKey.toBytes().toString("hex")).to.be.equal(publicKey.toBytes().toString("hex"));
  });
});
