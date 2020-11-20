import blst from "../src/blst";
import herumi from "../src/herumi";

export type Implementation = "blst" | "herumi";
export const implementations: Implementation[] = ["blst", "herumi"];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getBls(implementation: Implementation) {
  switch (implementation) {
    case "blst":
      return blst;
    case "herumi":
      return herumi;
  }
}

export function forEachImplementation(
  callback: (bls: ReturnType<typeof getBls>, implementation: Implementation) => void
): void {
  for (const implementation of implementations) {
    describe(implementation, () => {
      const bls = getBls(implementation);

      if (implementation === "herumi") {
        before(async () => {
          await bls.initBLS();
        });
      }

      callback(bls, implementation);
    });
  }
}
