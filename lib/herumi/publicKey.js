import { getContext } from "./context.js";
import { bytesToHex, hexToBytes, isZeroUint8Array } from "../helpers/index.js";
import { PointFormat } from "../types.js";
import { EmptyAggregateError, InvalidLengthError, ZeroPublicKeyError } from "../errors.js";
import { PUBLIC_KEY_LENGTH_COMPRESSED, PUBLIC_KEY_LENGTH_UNCOMPRESSED } from "../constants.js";
export class PublicKey {
    constructor(value) {
        if (value.isZero()) {
            throw new ZeroPublicKeyError();
        }
        this.value = value;
    }
    static fromBytes(bytes) {
        const context = getContext();
        const publicKey = new context.PublicKey();
        if (!isZeroUint8Array(bytes)) {
            if (bytes.length === PUBLIC_KEY_LENGTH_COMPRESSED) {
                publicKey.deserialize(bytes);
            }
            else if (bytes.length === PUBLIC_KEY_LENGTH_UNCOMPRESSED) {
                publicKey.deserializeUncompressed(bytes);
            }
            else {
                throw new InvalidLengthError("PublicKey", bytes.length);
            }
        }
        return new PublicKey(publicKey);
    }
    static fromHex(hex) {
        return this.fromBytes(hexToBytes(hex));
    }
    static aggregate(publicKeys) {
        if (publicKeys.length === 0) {
            throw new EmptyAggregateError();
        }
        const agg = new PublicKey(publicKeys[0].value.clone());
        for (const pk of publicKeys.slice(1)) {
            agg.value.add(pk.value);
        }
        return agg;
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
