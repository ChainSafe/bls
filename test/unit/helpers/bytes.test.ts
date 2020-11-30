import {expect} from "chai";
import {isZeroUint8Array} from "../../../src/helpers/utils";

describe("helpers / bytes", () => {
  describe("isZeroUint8Array", () => {
    const testCases: {isZero: boolean; hex: string}[] = [
      {hex: "0x00", isZero: true},
      {hex: "0x" + "00".repeat(32), isZero: true},
      {hex: "0x" + "00".repeat(96), isZero: true},
      {hex: "0x" + "00".repeat(31) + "01", isZero: false},
      {
        hex: "0xb6f21199594b56d77670564bf422cb331d5281ca2c1f9a45588a56881d8287ef8619efa6456d6cd2ef61306aa5b21311",
        isZero: false,
      },
    ];

    for (const {hex, isZero} of testCases) {
      it(`${hex} isZero = ${isZero}`, () => {
        const bytes = hexToBytesNode(hex);
        expect(isZeroUint8Array(bytes)).to.equal(isZero);
      });
    }
  });
});

function hexToBytesNode(hex: string): Buffer {
  return Buffer.from(hex.replace("0x", ""), "hex");
}
