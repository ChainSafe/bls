# blst-ts

![ETH2.0_Spec_Version 0.12.0](https://img.shields.io/badge/ETH2.0_Spec_Version-0.12.0-2e86c1.svg)
![ES Version](https://img.shields.io/badge/ES-2017-yellow)
![Node Version](https://img.shields.io/badge/node-14.x-green)

Typescript wrapper for [supranational/blst](https://github.com/supranational/blst) native bindings, a highly performant BLS12-381 signature library.

## Supported Environments

| OS / Arch     | binary name | Node                               |
| ------------- | ----------- | ---------------------------------- |
| Linux / x64   | linux-x64   | 18, 20 |
| Linux / arm64 | linux-arm64 | 18, 20 |
| Windows / x64 | win32-x64   | 18, 20 |
| macOS / x64     | darwin-x64  | 18, 20 |
| macOS / arm64      | darwin-arm64  | 18, 20 |

\* No Github nor docker buildx setup to build this environment in CI. Source may compile locally after installation but it's not guaranteed

## Usage

```bash
yarn add @chainsafe/blst
```

This library comes with pre-compiled bindings for most platforms. You can check current support in [releases](https://github.com/ChainSafe/blst-ts/releases). If your platform is not supported, bindings will be compiled from source as a best effort with node-gyp.

```ts
import {SecretKey, verify} from "@chainsafe/blst";

const msg = Buffer.from("sample-msg");
const sk = SecretKey.fromKeygen(Buffer.alloc(32, 1));
const pk = sk.toPublicKey();
const sig = sk.sign(msg);

console.log(verify(msg, pk, sig)); // true
```

This library exposes two types of classes for public keys and signatures: `PublicKey` & `AggregatePublicKey`, `Signature` & `AggregateSignature`

- `PublicKey`: Contains an affine point (x,y). It's the default representation of the point and what you need to serialize to and deserialize from.
- `AggregatePublicKey`: Contains a jacobian point (x,y,z). It's optimal to perform aggregation operations.

## Spec versioning

This library has a hardcoded configuration compatible with Eth2.0 spec:

| Setting        | value                                         |
| -------------- | --------------------------------------------- |
| PK_IN          | `G1`                                          |
| HASH_OR_ENCODE | `true`                                        |
| DST            | `BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_POP_` |
| RAND_BITS      | `64`                                          |

> [spec](https://github.com/ethereum/eth2.0-specs/blob/v0.11.1/specs/phase0/beacon-chain.md#bls-signatures)

> [test vectors](https://github.com/ethereum/consensus-spec-tests/tree/master/tests/general)

## Developing

Note that this repo contains a git submodule. Make sure the git submodule `blst` is populated before attempting to build locally. After cloning run:

```
git submodule update --init --recursive
```

## Release

The release process is automatically [triggered](.github/workflows/main.yml#195) when a tagged commit is pushed.

To create a new release: 

1. First, increment the project version in [package.json](package.json#3) and merge the associated commit
2. Then tag this commit with `git tag v${NEW_VERSION}`
3. Finally push the new tag with `git push ${REMOTE} v${NEW_VERSION}`

## License

Apache-2.0
