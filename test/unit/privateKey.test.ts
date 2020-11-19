import {PrivateKey, initBLS, destroy, SECRET_KEY_LENGTH} from "../../src";
import {expect} from "chai";

describe("privateKey", function () {
  before(async function () {
    await initBLS();
  });

  after(function () {
    destroy();
  });

  it("should generate fromKeygen private key", function () {
    const privateKey1 = PrivateKey.fromKeygen();
    const privateKey2 = PrivateKey.fromKeygen();
    expect(privateKey1.toHex()).to.not.be.equal(privateKey2.toHex());
  });

  it("should export private key to hex string", function () {
    const privateKey = "0x07656fd676da43883d163f49566c72b9cbf0a5a294f26808c807700732456da7";

    expect(PrivateKey.fromHex(privateKey).toHex()).to.be.equal(privateKey);

    const privateKey2 = "07656fd676da43883d163f49566c72b9cbf0a5a294f26808c807700732456da7";

    expect(PrivateKey.fromHex(privateKey2).toHex()).to.be.equal(privateKey);
  });

  it("should export private key to bytes", function () {
    expect(PrivateKey.fromKeygen().toBytes().length).to.be.equal(SECRET_KEY_LENGTH);
  });

  it("should not accept too short private key", function () {
    expect(() => PrivateKey.fromHex("0x2123")).to.throw();
  });
});
