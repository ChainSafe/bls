import blst from "@chainsafe/blst";
import { bytesToHex, hexToBytes } from "../helpers/index.js";
import { PointFormat } from "../types.js";
import { PublicKey } from "./publicKey.js";
import { EmptyAggregateError, ZeroSignatureError } from "../errors.js";
export class Signature {
    constructor(value) {
        this.value = value;
    }
    /** @param type Defaults to `CoordType.affine` */
    static fromBytes(bytes, type, validate = true) {
        // need to hack the CoordType so @chainsafe/blst is not a required dep
        const sig = blst.Signature.deserialize(bytes, type);
        if (validate)
            sig.sigValidate();
        return new Signature(sig);
    }
    static fromHex(hex) {
        return this.fromBytes(hexToBytes(hex));
    }
    static aggregate(signatures) {
        if (signatures.length === 0) {
            throw new EmptyAggregateError();
        }
        const agg = blst.aggregateSignatures(signatures.map(Signature.convertToBlstSignatureArg));
        return new Signature(agg);
    }
    static verifyMultipleSignatures(sets) {
        return blst.verifyMultipleAggregateSignatures(sets.map((set) => ({
            message: set.message,
            publicKey: PublicKey.convertToBlstPublicKeyArg(set.publicKey),
            signature: Signature.convertToBlstSignatureArg(set.signature),
        })));
    }
    static asyncVerifyMultipleSignatures(sets) {
        return blst.asyncVerifyMultipleAggregateSignatures(sets.map((set) => ({
            message: set.message,
            publicKey: PublicKey.convertToBlstPublicKeyArg(set.publicKey),
            signature: Signature.convertToBlstSignatureArg(set.signature),
        })));
    }
    static convertToBlstSignatureArg(signature) {
        return signature instanceof Signature ? signature.value : signature;
    }
    /**
     * Implemented for SecretKey to be able to call .sign()
     */
    static friendBuild(sig) {
        return new Signature(sig);
    }
    verify(publicKey, message) {
        // TODO (@matthewkeil) The note in aggregateVerify and the checks in this method
        // do not seem to go together. Need to check the spec further.
        // Individual infinity signatures are NOT okay. Aggregated signatures MAY be infinity
        if (this.value.isInfinity()) {
            throw new ZeroSignatureError();
        }
        return blst.verify(message, PublicKey.convertToBlstPublicKeyArg(publicKey), this.value);
    }
    verifyAggregate(publicKeys, message) {
        return blst.fastAggregateVerify(message, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value);
    }
    verifyMultiple(publicKeys, messages) {
        return this.aggregateVerify(publicKeys, messages, false);
    }
    async asyncVerify(publicKey, message) {
        // TODO (@matthewkeil) The note in aggregateVerify and the checks in this method
        // do not seem to go together. Need to check the spec further.
        // Individual infinity signatures are NOT okay. Aggregated signatures MAY be infinity
        if (this.value.isInfinity()) {
            throw new ZeroSignatureError();
        }
        return blst.asyncVerify(message, PublicKey.convertToBlstPublicKeyArg(publicKey), this.value);
    }
    async asyncVerifyAggregate(publicKeys, message) {
        return blst.asyncFastAggregateVerify(message, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value);
    }
    async asyncVerifyMultiple(publicKeys, messages) {
        return this.aggregateVerify(publicKeys, messages, true);
    }
    toBytes(format) {
        if (format === PointFormat.uncompressed) {
            return this.value.serialize(false);
        }
        else {
            return this.value.serialize(true);
        }
    }
    toHex(format) {
        return bytesToHex(this.toBytes(format));
    }
    multiplyBy(bytes) {
        return new Signature(this.value.multiplyBy(bytes));
    }
    aggregateVerify(publicKeys, messages, runAsync) {
        // TODO (@matthewkeil) The note in verify and the checks in this method
        // do not seem to go together. Need to check the spec further.
        // If this set is simply an infinity signature and infinity publicKey then skip verification.
        // This has the effect of always declaring that this sig/publicKey combination is valid.
        // for Eth2.0 specs tests
        if (publicKeys.length === 1) {
            // eslint-disable-next-line prettier/prettier
            const pk = publicKeys[0] instanceof Uint8Array
                ? PublicKey.fromBytes(publicKeys[0])
                : publicKeys[0]; // need to cast to blst-native key instead of IPublicKey
            // @ts-expect-error Need to hack type to get access to the private `value`
            if (this.value.isInfinity() && pk.value.isInfinity()) {
                return runAsync ? Promise.resolve(true) : true;
            }
        }
        return runAsync
            ? blst.asyncAggregateVerify(messages, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value)
            : blst.aggregateVerify(messages, publicKeys.map(PublicKey.convertToBlstPublicKeyArg), this.value);
    }
}
