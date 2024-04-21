import { getImplementation } from "./getImplementation.js";
// Thanks https://github.com/iliakan/detect-node/blob/master/index.esm.js
const isNode = Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
let bls;
try {
    bls = await getImplementation(isNode ? "blst-native" : "herumi");
}
catch (e) {
    bls = await getImplementation("herumi");
}
export default bls;
