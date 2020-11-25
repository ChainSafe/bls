# bls

[![Build Status](https://travis-ci.org/ChainSafe/lodestar.svg?branch=master)](https://travis-ci.org/ChainSafe/lodestar)
[![codecov](https://codecov.io/gh/ChainSafe/lodestar/branch/master/graph/badge.svg)](https://codecov.io/gh/ChainSafe/lodestar)
![ETH2.0_Spec_Version 0.12.0](https://img.shields.io/badge/ETH2.0_Spec_Version-0.12.0-2e86c1.svg)
![ES Version](https://img.shields.io/badge/ES-2017-yellow)
![Node Version](https://img.shields.io/badge/node-12.x-green)

Javascript library for BLS (Boneh-Lynn-Shacham) signatures and signature aggregation.

## Usage

```ts
import {PrivateKey} from "@chainsafe/bls";

const secretKey = PrivateKey.fromKeygen();
const publicKey = secretKey.toPublicKey();
const message = new Uint8Array(32);

const signature = secretKey.sign(message);
console.log("Is valid: ", signature.verify(publicKey, message));
```

### Browser

If you are in the browser, import from `/browser`

```ts
import bls from "@chainsafe/bls/browser";
```

### Native bindings only

If you are in NodeJS, import from `/node` to skip browser specific code

```ts
import bls from "@chainsafe/bls/node";
```

### Native bindings + WASM fallback

If you want to offer a fallback in NodeJS, first try to load native bindings and then fallback to WASM

```ts
import bls from "@chainsafe/bls";

try {
  await bls.init("blst-native");
} catch (e) {
  await bls.init("herumi");
  console.warn("Using WASM");
}
```

The API is identical for all implementations.

## Spec versioning

| Version | Bls spec version |
| ------- | :--------------: |
| 2.x.x   |     draft #7     |
| 1.x.x   |     draft #6     |
| 0.3.x   | initial version  |

> [spec](https://github.com/ethereum/eth2.0-specs/blob/v0.11.1/specs/phase0/beacon-chain.md#bls-signatures)

> [test vectors](https://github.com/ethereum/eth2.0-spec-tests/tree/master/tests/bls)

## License

Apache-2.0
