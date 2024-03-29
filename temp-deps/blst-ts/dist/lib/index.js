/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const {resolve} = require("path");
const {randomBytes} = require("crypto");
const {getBindingsPath} = require("../utils");

/**
 * Need to support testing and productions environments. Prod is the first case
 * where the entrance file is PACKAGE_ROOT/dist/cjs/lib/index.js.  In the
 * bundled case the bindings file is copied/built to PACKAGE_ROOT/prebuild. For
 * testing (not fuzz tests) the entrance file is REPO_ROOT/lib/index.js and the
 * bindings file is built/copied to REPO_ROOT/prebuild. For fuzz testing the
 * entrance file is in REPO_ROOT/fuzz-test/lib/index.js and the bindings file
 * does not get copied and is still in REPO_ROOT/prebuild.
 */
const rootDir = __dirname.endsWith("dist/lib")
  ? resolve(__dirname, "..", "..")
  : __dirname.includes("fuzz-tests")
    ? resolve(__dirname, "..", "..")
    : resolve(__dirname, "..");
const bindingsPath = getBindingsPath(rootDir);

function prepareBindings(bindings) {
  bindings.SecretKey.prototype.toHex = function toHex() {
    return `0x${this.serialize().toString("hex")}`;
  };

  bindings.PublicKey.prototype.toHex = function toHex(compress) {
    return `0x${this.serialize(compress).toString("hex")}`;
  };

  bindings.Signature.prototype.toHex = function toHex(compress) {
    return `0x${this.serialize(compress).toString("hex")}`;
  };

  return {
    ...bindings,
    CoordType: {
      affine: 0,
      jacobian: 1,
    },
    randomBytesNonZero(bytesCount) {
      const rand = randomBytes(bytesCount);
      for (let i = 0; i < bytesCount; i++) {
        if (rand[i] !== 0) return rand;
      }
      rand[0] = 1;
      return rand;
    },
    verify(message, publicKey, signature) {
      return bindings.aggregateVerify([message], [publicKey], signature);
    },
    asyncVerify(message, publicKey, signature) {
      return bindings.asyncAggregateVerify([message], [publicKey], signature);
    },
    fastAggregateVerify(message, publicKeys, signature) {
      let key;
      try {
        // this throws for invalid key, catch and return false
        key = bindings.aggregatePublicKeys(publicKeys);
      } catch {
        return false;
      }
      return bindings.aggregateVerify([message], [key], signature);
    },
    asyncFastAggregateVerify(message, publicKeys, signature) {
      let key;
      try {
        // this throws for invalid key, catch and return false
        key = bindings.aggregatePublicKeys(publicKeys);
      } catch {
        return Promise.resolve(false);
      }
      return bindings.asyncAggregateVerify([message], [key], signature);
    },
  };
}

module.exports = prepareBindings(require(bindingsPath));
