# bls

[![Build Status](https://travis-ci.org/ChainSafe/lodestar.svg?branch=master)](https://travis-ci.org/ChainSafe/lodestar)
[![codecov](https://codecov.io/gh/ChainSafe/lodestar/branch/master/graph/badge.svg)](https://codecov.io/gh/ChainSafe/lodestar)
![ETH2.0_Spec_Version 1.0.0](https://img.shields.io/badge/ETH2.0_Spec_Version-1.0.0-2e86c1.svg)
![ES Version](https://img.shields.io/badge/ES-2017-yellow)
![Node Version](https://img.shields.io/badge/node-12.x-green)

Javascript library for BLS (Boneh-Lynn-Shacham) signatures and signature aggregation, tailored for use in Eth2.

## Usage

```bash
yarn add @chainsafe/bls
```

To use native bindings you must install peer dependency `@chainsafe/blst`

```bash
yarn add @chainsafe/bls @chainsafe/blst
```

You must initialize the library once in your application before using it. The result is cached and use across all your imports

```ts
import {init, SecretKey, secretKeyToPublicKey, sign, verify} from "@chainsafe/bls";

(async () => {
  await init("herumi");

  // class-based interface
  const secretKey = SecretKey.fromKeygen();
  const publicKey = secretKey.toPublicKey();
  const message = new Uint8Array(32);

  const signature = secretKey.sign(message);
  console.log("Is valid: ", signature.verify(publicKey, message));

  // functional interface
  const sk = secretKey.toBytes();
  const pk = secretKeyToPublicKey(sk);
  const sig = sign(sk, message);
  console.log("Is valid: ", verify(pk, message, sig));
})();
```

### Browser

If you are in the browser, import from `/browser` to import directly the WASM version

```ts
import bls from "@chainsafe/bls/browser";
```

### Native bindings only

If you are in NodeJS, import from `/node` to skip browser specific code. Also install peer dependency `@chainsafe/blst` which has the native bindings

```bash
yarn add @chainsafe/bls @chainsafe/blst
```

```ts
import bls from "@chainsafe/bls/node";
```

### Native bindings + WASM fallback

If you want to offer a fallback in NodeJS, first try to load native bindings and then fallback to WASM. Also install peer dependency `@chainsafe/blst` which has the native bindings

```bash
yarn add @chainsafe/bls @chainsafe/blst
```

```ts
import {init} from "@chainsafe/bls";

try {
  await init("blst-native");
} catch (e) {
  await init("herumi");
  console.warn("Using WASM");
}
```

The API is identical for all implementations.

## Benchmarks

- `blst`: [src/blst](src/blst) (node.js-only, bindings to C via node-gyp)
- `herumi`: [src/herumi](src/herumi) (node.js & browser, bindings to C++ via wasm)
- `noble`: [noble-bls12-381](https://github.com/paulmillr/noble-bls12-381) (node.js & browser, pure JS)

Results are in `ops/sec (x times slower)`, where `x times slower` = times slower than fastest implementation (`blst`).

| Function - `ops/sec`      | `blst` |   `herumi`   |   `noble`\*   |
| ------------------------- | :----: | :----------: | :-----------: |
| `verify`                  | 443.75 | 46.658 (x9)  | 12.355 (x36)  |
| `verifyAggregate` (30)    | 438.68 | 46.615 (x9)  | 9.8803 (x44)  |
| `verifyMultiple` (30)     | 35.138 | 3.4332 (x10) | 0.9217 (x38)  |
| `aggregate` (pubkeys, 30) | 15761  | 2603.5 (x6)  | 42.956 (x366) |
| `aggregate` (sigs, 30)    | 6587.8 | 1018.7 (x6)  |       -       |

\*`noble` methods include serialization and deserialization to bytes, which may impact all benchmarks specially `aggregate`.
\*\* `blst` and `herumi` performed 100 runs each, `noble` 10 runs.

Results from CI run https://github.com/ChainSafe/bls/runs/1488856560?check_suite_focus=true#step:12:13

## Spec versioning

| Version | Bls spec hash-to-curve version |
| ------- | :----------------------------: |
| 5.x.x   |            draft #9            |
| 2.x.x   |            draft #7            |
| 1.x.x   |            draft #6            |
| 0.3.x   |        initial version         |

> [spec](https://github.com/ethereum/eth2.0-specs/blob/v1.0.0/specs/phase0/beacon-chain.md#bls-signatures)

> [test vectors](https://github.com/ethereum/eth2.0-spec-tests/tree/master/tests/bls)

## License

Apache-2.0
