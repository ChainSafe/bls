// -----------------------------------------
// To be used in NodeJS testing environments
// node -r @chainsafe/bls/register
// -----------------------------------------

// blst-native initialization is syncronous
// Initialize bls here instead of in before() so it's available inside describe() blocks
import("./lib/index.js").then(({init}) => init("blst-native")).catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
