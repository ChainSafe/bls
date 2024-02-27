import * as blst from "../../temp-deps/blst-ts/lib/index.js";
import { bytesToHex, hexToBytes, isZeroUint8Array, randomBytes } from "../helpers/index.js";
import { SECRET_KEY_LENGTH } from "../constants.js";
import { PublicKey } from "./publicKey.js";
import { Signature } from "./signature.js";
import { ZeroSecretKeyError } from "../errors.js";
export class SecretKey {
    constructor(key) {
        this.key = key;
    }
    static fromBytes(bytes) {
        // draft-irtf-cfrg-bls-signature-04 does not allow SK == 0
        if (isZeroUint8Array(bytes)) {
            throw new ZeroSecretKeyError();
        }
        const sk = blst.SecretKey.deserialize(bytes);
        return new SecretKey(sk);
    }
    static fromHex(hex) {
        return this.fromBytes(hexToBytes(hex));
    }
    static fromKeygen(entropy) {
        const sk = blst.SecretKey.fromKeygen(entropy !== null && entropy !== void 0 ? entropy : randomBytes(SECRET_KEY_LENGTH));
        return new SecretKey(sk);
    }
    sign(message) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Signature.friendBuild(this.key.sign(message));
    }
    toPublicKey() {
        const pk = this.key.toPublicKey();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return PublicKey.friendBuild(pk);
    }
    toBytes() {
        return this.key.serialize();
    }
    toHex() {
        return bytesToHex(this.toBytes());
    }
}
