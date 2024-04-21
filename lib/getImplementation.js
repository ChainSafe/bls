// Thanks https://github.com/iliakan/detect-node/blob/master/index.esm.js
const isNode = Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
export async function getImplementation(impl = "herumi") {
    switch (impl) {
        case "herumi": {
            return (await import("./herumi/index.js")).bls;
        }
        case "blst-native":
            // Lazy import native bindings to prevent automatically importing binding.node files
            if (!isNode) {
                throw Error("blst-native is only supported in NodeJS");
            }
            return (await import("./blst-native/index.js")).bls;
        default:
            throw new Error(`Unsupported implementation - ${impl}`);
    }
}
