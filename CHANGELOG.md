# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.1.1] - 2022-05-15

### Chores

- bump blst peer dependency [#130](https://github.com/ChainSafe/bls/pull/130)

## [7.1.0] - 2022-05-09

### Features

- add errors and constants to exports [#128](https://github.com/ChainSafe/bls/pull/128)

## [7.0.0] - 2022-05-05

### BREAKING CHANGES

- ESM Support [#121](https://github.com/ChainSafe/bls/pull/121)

## [6.0.3] - 2021-09-25

- bls-eth-wasm (herumi) package update to 0.4.8 for invalidating signature not in G2 [#106](https://github.com/ChainSafe/bls/pull/106)
- Signature.fromBytes now has default verification on [#106](https://github.com/ChainSafe/bls/pull/106)


## [6.0.2] - 2021-08-23

- Add register script [#102](https://github.com/ChainSafe/bls/pull/102)

## [6.0.1] - 2021-04-05

- Add validate key option to PublicKey.fromBytes() [#90](https://github.com/ChainSafe/bls/pull/90)

## [6.0.0] - 2021-04-05

- Allow to export points compressed and uncompressed [#85](https://github.com/ChainSafe/bls/pull/85)
- For BLST impl allow to choose what point coordinates to deserialize to [#85](https://github.com/ChainSafe/bls/pull/85)
- Update function signature of `verifyMultipleSignatures()` to use grouped signature sets [#85](https://github.com/ChainSafe/bls/pull/85)
- Bump BLST implementation to fix multi-thread issues [#85](https://github.com/ChainSafe/bls/pull/85)

## [5.1.1] - 2020-12-18

- Enable worker-threads support for blst [#76](https://github.com/ChainSafe/bls/pull/76)

## [5.1.0] - 2020-11-30

- Bump @chainsafe/lodestar-spec-test-util [#56](https://github.com/ChainSafe/bls/pull/56)
- Add benchmark results [#57](https://github.com/ChainSafe/bls/pull/57)
- Add verifyMultipleSignatures method [#58](https://github.com/ChainSafe/bls/pull/58)
- Set strictNullChecks to true [#67](https://github.com/ChainSafe/bls/pull/67)
- Simplify build setup with tsc [#68](https://github.com/ChainSafe/bls/pull/68)

## [5.0.1] - 2020-11-30

- Remove foreign property breaking types ([ccd870](https://github.com/chainsafe/bls/commit/ccd870))
- Deduplicate interface ([0bf6e9](https://github.com/chainsafe/bls/commit/0bf6e9))
- Deprecate IKeypair ([293286](https://github.com/chainsafe/bls/commit/293286))

## [5.0.0] - 2020-11-30

### BREAKING CHANGES

- Compatible with [Eth2 spec 1.0.0](https://github.com/ethereum/eth2.0-specs/blob/v1.0.0/specs/phase0/beacon-chain.md#bls-signatures)
- Update bls-keygen to latest EIP-2333 standard
- Refactored class-based interface, minor functional interface changes
- BLST support

## [4.0.0] - 2020-08-31

### BREAKING CHANGES

- Signature.verifyAggregate now takes decompressed pubkeys instead of raw bytes of compressed key

## [3.0.0] - 2020-07-31

### BREAKING CHANGES

- Update bls-keygen to latest EIP-2333 standard ([55dd5d](https://github.com/chainsafe/bls/commit/55dd5d))

## [2.0.0] - 2020-05-21

Compatible with [Eth2 spec 0.12.0](https://github.com/ethereum/eth2.0-specs/blob/v0.12.0/specs/phase0/beacon-chain.md#bls-signatures)
and [IETF draft bls specification](https://github.com/ethereum/eth2.0-specs/blob/v0.12.0/specs/phase0/beacon-chain.md#bls-signatures)

## [1.0.0] - 2020-02-25

Compatible with [Eth2 spec 0.10.1](https://github.com/ethereum/eth2.0-specs/blob/v0.10.1/specs/phase0/beacon-chain.md#bls-signatures)
and [IETF draft bls specification](https://github.com/ethereum/eth2.0-specs/blob/v0.10.1/specs/phase0/beacon-chain.md#bls-signatures)

### BREAKING CHANGES

- domain param is removed from all apis
- message length constraint is changed

## [0.3.0] - 2020-02-20

### BREAKING CHANGES

- Uint8Array inputs in functional interface

## [0.2.2] - 2020-02-12

###Bugfixes:

- updated bls wasm binding version - it isn't catching unhandled rejections and modify stacktraces
