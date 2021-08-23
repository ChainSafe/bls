const {init} = require("./lib");

// -----------------------------------------
// To be used in NodeJS testing environments
// node -r @chainsafe/bls/register
// -----------------------------------------

// blst-native initialization is syncronous
// Initialize bls here instead of in before() so it's available inside describe() blocks
init("blst-native").catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
