import { generateRandomSecretKey } from "@chainsafe/bls-keygen";
import { SECRET_KEY_LENGTH } from "../constants.js";
import { getContext } from "./context.js";
import { PublicKey } from "./publicKey.js";
import { Signature } from "./signature.js";
import { bytesToHex, hexToBytes } from "../helpers/index.js";
import { InvalidLengthError, ZeroSecretKeyError } from "../errors.js";
export class SecretKey {
    constructor(value) {
        if (value.isZero()) {
            throw new ZeroSecretKeyError();
        }
        this.value = value;
    }
    static fromBytes(bytes) {
        if (bytes.length !== SECRET_KEY_LENGTH) {
            throw new InvalidLengthError("SecretKey", SECRET_KEY_LENGTH);
        }
        const context = getContext();
        const secretKey = new context.SecretKey();
        secretKey.deserialize(bytes);
        return new SecretKey(secretKey);
    }
    static fromHex(hex) {
        return this.fromBytes(hexToBytes(hex));
    }
    static fromKeygen(entropy) {
        const sk = generateRandomSecretKey(entropy);
        return this.fromBytes(sk);
    }
    sign(message) {
        return new Signature(this.value.sign(message));
    }
    toPublicKey() {
        return new PublicKey(this.value.getPublicKey());
    }
    toBytes() {
        return this.value.serialize();
    }
    toHex() {
        return bytesToHex(this.toBytes());
    }
}
