import { getContext } from "./context.js";
import { bytesToHex, hexToBytes, isZeroUint8Array, validateBytes } from "../helpers/index.js";
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
        const context = getContext();
        const agg = new context.PublicKey();
        for (const publicKey of publicKeys) {
            agg.add(PublicKey.convertToPublicKeyType(publicKey));
        }
        return new PublicKey(agg);
    }
    static convertToPublicKeyType(publicKey) {
        let pk;
        if (publicKey instanceof Uint8Array) {
            validateBytes(publicKey, "publicKey");
            pk = PublicKey.fromBytes(publicKey);
        }
        else {
            // need to cast to herumi key instead of IPublicKey
            pk = publicKey;
        }
        return pk.value;
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
    multiplyBy(_bytes) {
        // TODO: I found this in the code but its not exported. Need to figure out
        //       how to implement
        // const a = getContext();
        // const randomness = new a.FR(8);
        // return new PublicKey(a.mul(this.value, randomness));
        throw new Error("multiplyBy is not implemented by bls-eth-wasm");
    }
}
