import {getImplementation} from "../src/getImplementation.js";
import {IBls, Implementation} from "../src/types.js";

export async function runForAllImplementations(
  callback: (bls: IBls, implementation: Implementation) => void
): Promise<void> {
  for (const implementation of ["blst-native", "herumi"] as Implementation[]) {
    const bls = await getImplementation(implementation);
    callback(bls, implementation);
  }
}

export function describeForAllImplementations(callback: (bls: IBls) => void): void {
  runForAllImplementations((bls, implementation) => {
    describe(implementation, function () {
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
