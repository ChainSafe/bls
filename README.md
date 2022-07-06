# bls

[![codecov](https://codecov.io/gh/ChainSafe/lodestar/branch/master/graph/badge.svg)](https://codecov.io/gh/ChainSafe/lodestar)
![ETH2.0_Spec_Version 1.0.0](https://img.shields.io/badge/ETH2.0_Spec_Version-1.0.0-2e86c1.svg)
![ES Version](https://img.shields.io/badge/ES-2022-yellow)
![Node Version](https://img.shields.io/badge/node-14.8-green)

Javascript library for BLS (Boneh-Lynn-Shacham) signatures and signature aggregation, tailored for use in Eth2.

## Usage

```bash
yarn add @chainsafe/bls
```

To use native bindings you must install peer dependency `@chainsafe/blst`

```bash
yarn add @chainsafe/bls @chainsafe/blst
```

By default, native bindings will be used if in NodeJS and they are installed. A WASM implementation ("herumi") is used as a fallback in case any error occurs.

```ts
import bls from "@chainsafe/bls";

(async () => {
    // class-based interface
    const secretKey = bls.SecretKey.fromKeygen();
    const publicKey = secretKey.toPublicKey();
    const message = new Uint8Array(32);

    const signature = secretKey.sign(message);
    console.log("Is valid: ", signature.verify(publicKey, message));

    // functional interface
    const sk = secretKey.toBytes();
    const pk = bls.secretKeyToPublicKey(sk);
    const sig = bls.sign(sk, message);
    console.log("Is valid: ", bls.verify(pk, message, sig));
})();
```

### Browser

If you are in the browser, import from `/herumi` to explicitly import the WASM version

```ts
import bls from "@chainsafe/bls/herumi";
```

### Native bindings only

If you are in NodeJS, import from `/blst-native` to explicitly import the native bindings. Also install peer dependency `@chainsafe/blst` which has the native bindings

```bash
yarn add @chainsafe/bls @chainsafe/blst
```

```ts
import bls from "@chainsafe/bls/blst-native";
```

### Get implementation at runtime

If you need to get a bls implementation at runtime, import from `/getImplementation`.

```ts
import {getImplementation} from "@chainsafe/bls/getImplementation";

const bls = await getImplementation("herumi");
```

### Switchable singleton

If you need a singleton that is switchable at runtime (the default behavior in <=v6), import from `/switchable`.

```ts
import bls, {init} from "@chainsafe/bls/switchable";

// here `bls` is uninitialized
await init("herumi");
// here `bls` is initialized
// now other modules can `import bls from "@chainsafe/bls/switchable"` and it will be initialized
```

The API is identical for all implementations.

## Benchmarks

- `blst`: [src/blst-native](src/blst-native) (node.js-only, bindings to C via node-gyp)
- `herumi`: [src/herumi](src/herumi) (node.js & browser, wasm)
- `noble`: [noble-bls12-381](https://github.com/paulmillr/noble-bls12-381) (node.js & browser, pure JS)

Results are in `ops/sec (x times slower)`, where `x times slower` = times slower than fastest implementation (`blst`).

| Function - `ops/sec`             | `blst` |   `herumi`   |   `noble`   |
| -------------------------------- | :----: | :----------: | :-----------: |
| `verify`                         | 326.38 | 47.674 (x7)  | 17.906 (x18)  |
| `verifyAggregate` (30)           | 453.29 | 51.151 (x9)  | 18.372 (x25)  |
| `verifyMultiple` (30)            | 34.497 | 3.5233 (x10) | 2.0286 (x17)  |
| `verifyMultipleSignatures` (30)  | 26.381 | 3.1633 (x8)  | -             |
| `aggregate` (pubkeys, 30)        | 15686  | 2898.9 (x5)  | 1875.0 (x8)   |
| `aggregate` (sigs, 30)           | 6373.4 | 1033.0 (x6)  | 526.25 (x12)  |
| `sign`                           | 925.49 | 108.81 (x9)  | 10.246 (x90)  |

\* `blst` and `herumi` performed 100 runs each, `noble` 10 runs.

Results from CI run https://github.com/ChainSafe/bls/runs/1513710175?check_suite_focus=true#step:12:13

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
