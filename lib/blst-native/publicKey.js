import blst from "@chainsafe/blst";
import { EmptyAggregateError } from "../errors.js";
import { bytesToHex, hexToBytes } from "../helpers/index.js";
import { PointFormat } from "../types.js";
export class PublicKey {
    constructor(value) {
        this.value = value;
    }
    /** @param type Defaults to `CoordType.jacobian` */
    static fromBytes(bytes, type, validate = true) {
        // need to hack the CoordType so @chainsafe/blst is not a required dep
        const pk = blst.PublicKey.deserialize(bytes, type);
        if (validate)
            pk.keyValidate();
        return new PublicKey(pk);
    }
    static fromHex(hex) {
        return this.fromBytes(hexToBytes(hex));
    }
    static aggregate(publicKeys) {
        if (publicKeys.length === 0) {
            throw new EmptyAggregateError();
        }
        const pk = blst.aggregatePublicKeys(publicKeys.map(PublicKey.convertToBlstPublicKeyArg));
        return new PublicKey(pk);
    }
    static convertToBlstPublicKeyArg(publicKey) {
        return publicKey instanceof PublicKey ? publicKey.value : publicKey;
    }
    /**
     * Implemented for SecretKey to be able to call .toPublicKey()
     */
    static friendBuild(key) {
        return new PublicKey(key);
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
        return new PublicKey(this.value.multiplyBy(bytes));
    }
}
