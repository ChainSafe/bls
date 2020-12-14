import blst from "../src/blst";
import herumi from "../src/herumi";
import {IBls} from "../src/interface";

export type Implementation = "blst" | "herumi";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getBls(implementation: Implementation): IBls {
  switch (implementation) {
    case "blst":
      return blst;
    case "herumi":
      return herumi;
  }
}

export async function runForAllImplementations(
  callback: (bls: IBls, implementation: Implementation) => void
): Promise<void> {
  for (const implementation of ["blst", "herumi"] as Implementation[]) {
    const bls = getBls(implementation);
    await bls.init();
    callback(bls, implementation);
  }
}

export function describeForAllImplementations(callback: (bls: IBls) => void): void {
  runForAllImplementations((bls, implementation) => {
    describe(implementation, function () {
      before(async () => {
        await bls.init();
      });

      try {
        callback(bls);
      } catch (e) {
        it("Error generating test cases", function (done) {
          done(e);
        });
      }
    });
  });
}
