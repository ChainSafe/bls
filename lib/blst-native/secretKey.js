import blst from "@chainsafe/blst";
import crypto from "crypto";
import { bytesToHex, hexToBytes, isZeroUint8Array } from "../helpers/index.js";
import { SECRET_KEY_LENGTH } from "../constants.js";
import { PublicKey } from "./publicKey.js";
import { Signature } from "./signature.js";
import { ZeroSecretKeyError } from "../errors.js";
export class SecretKey {
    constructor(value) {
        this.value = value;
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
        const sk = blst.SecretKey.fromKeygen(entropy || crypto.randomBytes(SECRET_KEY_LENGTH));
        return new SecretKey(sk);
    }
    sign(message) {
        // @ts-expect-error Need to hack private constructor with static method
        return Signature.friendBuild(this.value.sign(message));
    }
    toPublicKey() {
        const pk = this.value.toPublicKey();
        // @ts-expect-error Need to hack private constructor with static method
        return PublicKey.friendBuild(pk);
    }
    toBytes() {
        return this.value.serialize();
    }
    toHex() {
        return bytesToHex(this.toBytes());
    }
}
