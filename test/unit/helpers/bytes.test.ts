import {expect} from "chai";
import {concatUint8Arrays, isZeroUint8Array} from "../../../src/helpers/utils.js";
import {hexToBytesNode} from "../../util.js";

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

  describe("concatUint8Arrays", () => {
    it("Should merge multiple Uint8Array", () => {
      const bytesArr = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5]),
        new Uint8Array([6]),
        new Uint8Array([7, 8]),
        new Uint8Array([9, 10, 11]),
      ];

      const expectedBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

      const bytes = concatUint8Arrays(bytesArr);

      expect(bytes.toString()).to.equal(expectedBytes.toString());
    });
  });
});
