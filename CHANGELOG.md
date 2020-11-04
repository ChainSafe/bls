# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [dev]

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
