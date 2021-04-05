import {expect} from "chai";
import {chunkify} from "./utils";

describe("chunkify", () => {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15];

  const results = {
    0: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15]],
    1: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15]],
    2: [
      [0, 1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 12, 13, 14, 15],
    ],
    3: [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 12, 13, 14, 15],
    ],
    4: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 12],
      [13, 14, 15],
    ],
    5: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [9, 10, 12],
      [13, 14, 15],
    ],
    6: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [9, 10, 12],
      [13, 14, 15],
    ],
    7: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 12], [13, 14], [15]],
    8: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 12], [13, 14], [15]],
  };

  const testCases: {
    id: string;
    n: number;
    arr: number[];
    expectArr: number[][];
  }[] = Object.entries(results).map(([i, expectArr]) => ({
    id: i,
    n: parseInt(i),
    arr,
    expectArr,
  }));

  for (const {id, arr, n, expectArr} of testCases) {
    it(id, () => {
      expect(chunkify(arr, n)).to.deep.equal(expectArr);
    });
  }
});
