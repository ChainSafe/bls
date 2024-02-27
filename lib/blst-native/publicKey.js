import * as blst from "../../temp-deps/blst-ts/lib/index.js";
import { EmptyAggregateError } from "../errors.js";
import { bytesToHex, hexToBytes } from "../helpers/index.js";
import { PointFormat } from "../types.js";
export class PublicKey {
    constructor(key) {
        this.key = key;
    }
    /** @param type Defaults to `CoordType.jacobian` */
    static fromBytes(bytes, type, validate) {
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
        const pk = blst.aggregatePublicKeys(publicKeys.map(({ key }) => key));
        return new PublicKey(pk);
    }
    /**
     * Implemented for SecretKey to be able to call .toPublicKey()
     */
    static friendBuild(key) {
        return new PublicKey(key);
    }
    toBytes(format) {
        if (format === PointFormat.uncompressed) {
            return this.key.serialize(false);
        }
        else {
            return this.key.serialize(true);
        }
    }
    toHex(format) {
        return bytesToHex(this.toBytes(format));
    }
    multiplyBy(bytes) {
        return new PublicKey(this.key.multiplyBy(bytes));
    }
}
