/* eslint-disable @typescript-eslint/no-explicit-any */
import * as blst from "../temp-deps/blst-ts/lib/index.js";
import { validateBytes } from "./helpers/index.js";
import { NotInitializedError } from "./errors.js";
// Returned type is enforced at each implementation's index
// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
export function functionalInterfaceFactory({ implementation, SecretKey, PublicKey, Signature, }) {
    /**
     * Signs given message using secret key.
     * @param secretKey
     * @param message
     */
    function sign(secretKey, message) {
        validateBytes(secretKey, "secretKey");
        validateBytes(message, "message");
        return SecretKey.fromBytes(secretKey).sign(message).toBytes();
    }
    /**
     * Compines all given signature into one.
     * @param signatures
     */
    function aggregateSignatures(signatures) {
        const agg = Signature.aggregate(signatures.map((p) => Signature.fromBytes(p)));
        return agg.toBytes();
    }
    /**
     * Combines all given public keys into single one
     * @param publicKeys
     */
    function aggregatePublicKeys(publicKeys) {
        const agg = PublicKey.aggregate(publicKeys.map((p) => PublicKey.fromBytes(p)));
        return agg.toBytes();
    }
    /**
     * Verifies if signature is message signed with given public key.
     * @param publicKey
     * @param message
     * @param signature
     */
    function verify(publicKey, message, signature) {
        if (implementation === "herumi") {
            validateBytes(publicKey, "publicKey");
            validateBytes(message, "message");
            validateBytes(signature, "signature");
        }
        try {
            return Signature.fromBytes(signature).verify(PublicKey.fromBytes(publicKey), message);
        }
        catch (e) {
            if (e instanceof NotInitializedError)
                throw e;
            return false;
        }
    }
    async function asyncVerify(message, publicKey, signature) {
        if (implementation === "herumi") {
            throw new Error("WASM implementation does not support asyncVerify, use verify instead");
        }
        const pk = publicKey instanceof PublicKey ? publicKey.key : publicKey;
        const sig = signature instanceof Signature
            ? signature.sig
            : blst.Signature.deserialize(signature);
        if (sig.isInfinity()) {
            false;
        }
        try {
            return blst.asyncVerify(message, pk, sig);
        }
        catch {
            return false;
        }
    }
    /**
     * Verifies if aggregated signature is same message signed with given public keys.
     * @param publicKeys
     * @param message
     * @param signature
     */
    function verifyAggregate(publicKeys, message, signature) {
        validateBytes(publicKeys, "publicKey");
        validateBytes(message, "message");
        validateBytes(signature, "signature");
        try {
            return Signature.fromBytes(signature).verifyAggregate(publicKeys.map((publicKey) => PublicKey.fromBytes(publicKey)), message);
        }
        catch (e) {
            if (e instanceof NotInitializedError)
                throw e;
            return false;
        }
    }
    async function asyncVerifyAggregate(message, publicKeys, signature) {
        if (implementation === "herumi") {
            throw new Error("WASM implementation does not support asyncVerifyAggregate, use verifyAggregate instead");
        }
        const pks = publicKeys.map((pk) => (pk instanceof PublicKey ? pk.key : pk));
        const sig = signature instanceof Signature ? signature.sig : signature;
        // TODO: (matthewkeil) check spec to make sure this sig does not need inf check
        try {
            return blst.fastAggregateVerify(message, pks, sig);
        }
        catch {
            return false;
        }
    }
    /**
     * Verifies if signature is list of message signed with corresponding public key.
     * @param publicKeys
     * @param messages
     * @param signature
     * @param fast Check if all messages are different
     */
    function verifyMultiple(publicKeys, messages, signature) {
        validateBytes(publicKeys, "publicKey");
        validateBytes(messages, "message");
        validateBytes(signature, "signature");
        if (publicKeys.length === 0 || publicKeys.length != messages.length) {
            return false;
        }
        try {
            return Signature.fromBytes(signature).verifyMultiple(publicKeys.map((publicKey) => PublicKey.fromBytes(publicKey)), messages.map((msg) => msg));
        }
        catch (e) {
            if (e instanceof NotInitializedError)
                throw e;
            return false;
        }
    }
    async function asyncVerifyMultiple(messages, publicKeys, signature) {
        if (implementation === "herumi") {
            throw new Error("WASM implementation does not support asyncVerifyMultiple, use verifyMultiple instead");
        }
        if (publicKeys.length === 0 || publicKeys.length != messages.length) {
            return false;
        }
        const pks = publicKeys.map((pk) => (pk instanceof PublicKey ? pk.key : pk));
        const sig = signature instanceof Signature ? signature.sig : signature;
        // TODO: (matthewkeil) check spec to make sure this sig does not need inf check
        try {
            return blst.aggregateVerify(messages, pks, sig);
        }
        catch {
            return false;
        }
    }
    /**
     * Verifies multiple signatures at once returning true if all valid or false
     * if at least one is not. Optimization useful when knowing which signature is
     * wrong is not relevant, i.e. verifying an entire Eth2.0 block.
     *
     * This method provides a safe way to do so by multiplying each signature by
     * a random number so an attacker cannot craft a malicious signature that won't
     * verify on its own but will if it's added to a specific predictable signature
     * https://ethresear.ch/t/fast-verification-of-multiple-bls-signatures/5407
     */
    function verifyMultipleSignatures(sets) {
        if (!sets)
            throw Error("sets is null or undefined");
        try {
            return Signature.verifyMultipleSignatures(sets.map((s) => ({
                publicKey: PublicKey.fromBytes(s.publicKey),
                message: s.message,
                signature: Signature.fromBytes(s.signature),
            })));
        }
        catch (e) {
            if (e instanceof NotInitializedError)
                throw e;
            return false;
        }
    }
    async function asyncVerifyMultipleSignatures(sets) {
        if (!sets)
            throw Error("sets is null or undefined");
        try {
            return blst.asyncVerifyMultipleAggregateSignatures(sets.map((set) => ({
                message: set.message,
                publicKey: set.publicKey instanceof PublicKey ? set.publicKey.key : set.publicKey,
                signature: set.signature instanceof Signature ? set.signature.sig : set.signature,
            })));
        }
        catch {
            return false;
        }
    }
    /**
     * Computes a public key from a secret key
     */
    function secretKeyToPublicKey(secretKey) {
        validateBytes(secretKey, "secretKey");
        return SecretKey.fromBytes(secretKey).toPublicKey().toBytes();
    }
    return {
        sign,
        aggregateSignatures,
        aggregatePublicKeys,
        verify,
        verifyAggregate,
        verifyMultiple,
        verifyMultipleSignatures,
        asyncVerify,
        asyncVerifyAggregate,
        asyncVerifyMultiple,
        asyncVerifyMultipleSignatures,
        secretKeyToPublicKey,
    };
}