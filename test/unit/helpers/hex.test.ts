import {expect} from "chai";
import {hexToBytes, bytesToHex} from "../../../src/helpers/hex.js";
import {hexToBytesNode} from "../../util.js";

describe("helpers / hex", () => {
  const testCases: {id: string; hex: string}[] = [
    {
      id: "pubkey",
      hex: "0xb6f21199594b56d77670564bf422cb331d5281ca2c1f9a45588a56881d8287ef8619efa6456d6cd2ef61306aa5b21311",
    },
  ];

  for (const {id, hex} of testCases) {
    it(`${id} hexToBytes`, () => {
      const expectedBytes = hexToBytesNode(hex);
      const bytes = hexToBytes(hex);
      expect(expectedBytes.equals(bytes)).equals(true);
    });

    it(`${id} bytesToHex`, () => {
      const bytes = hexToBytesNode(hex);
      const _hex = bytesToHex(bytes);
      expect(_hex).to.equal(hex);
    });
  }
});
