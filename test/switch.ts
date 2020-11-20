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

export function forEachImplementation(
  implementations: Implementation[],
  callback: (bls: ReturnType<typeof getBls>, implementation: Implementation) => void
): void {
  for (const implementation of implementations) {
    describe(implementation, () => {
      const bls = getBls(implementation);

      before(async () => {
        await bls.initBLS();
      });

      callback(bls, implementation);
    });
  }
}
