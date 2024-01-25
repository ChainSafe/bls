import { getContext } from "./context.js";
import { bytesToHex, concatUint8Arrays, hexToBytes, isZeroUint8Array } from "../helpers/index.js";
import { PointFormat } from "../types.js";
import { EmptyAggregateError, InvalidLengthError, InvalidOrderError } from "../errors.js";
import { SIGNATURE_LENGTH_COMPRESSED, SIGNATURE_LENGTH_UNCOMPRESSED } from "../constants.js";
export class Signature {
    constructor(value) {
        if (!value.isValidOrder()) {
            throw new InvalidOrderError();
        }
        this.value = value;
    }
    /**
     * @param type Does not affect `herumi` implementation, always de-serializes to `jacobian`
     * @param validate With `herumi` implementation signature validation is always on regardless of this flag.
     */
    static fromBytes(bytes, _type, _validate = true) {
        const context = getContext();
        const signature = new context.Signature();
        if (!isZeroUint8Array(bytes)) {
            if (bytes.length === SIGNATURE_LENGTH_COMPRESSED) {
                signature.deserialize(bytes);
            }
            else if (bytes.length === SIGNATURE_LENGTH_UNCOMPRESSED) {
                signature.deserializeUncompressed(bytes);
            }
            else {
                throw new InvalidLengthError("Signature", bytes.length);
            }
            signature.deserialize(bytes);
        }
        return new Signature(signature);
    }
    static fromHex(hex) {
        return this.fromBytes(hexToBytes(hex));
    }
    static aggregate(signatures) {
        if (signatures.length === 0) {
            throw new EmptyAggregateError();
        }
        const context = getContext();
        const signature = new context.Signature();
        signature.aggregate(signatures.map((sig) => sig.value));
        return new Signature(signature);
    }
    static verifyMultipleSignatures(sets) {
        const context = getContext();
        return context.multiVerify(sets.map((s) => s.publicKey.value), sets.map((s) => s.signature.value), sets.map((s) => s.message));
    }
    verify(publicKey, message) {
        return publicKey.value.verify(this.value, message);
    }
    verifyAggregate(publicKeys, message) {
        return this.value.fastAggregateVerify(publicKeys.map((key) => key.value), message);
    }
    verifyMultiple(publicKeys, messages) {
        return this.value.aggregateVerifyNoCheck(publicKeys.map((key) => key.value), concatUint8Arrays(messages));
    }
    toBytes(format) {
        if (format === PointFormat.uncompressed) {
            return this.value.serializeUncompressed();
        }
        else {
            return this.value.serialize();
        }
    }
    toHex(format) {
        return bytesToHex(this.toBytes(format));
    }
}
