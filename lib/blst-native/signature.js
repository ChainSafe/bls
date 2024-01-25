/* eslint-disable @typescript-eslint/no-explicit-any */
import * as blst from "@chainsafe/blst-ts";
import { bytesToHex, hexToBytes } from "../helpers/index.js";
import { PointFormat } from "../types.js";
import { EmptyAggregateError, ZeroSignatureError } from "../errors.js";
export class Signature {
    constructor(sig) {
        this.sig = sig;
    }
    /** @param type Defaults to `CoordType.affine` */
    static fromBytes(bytes, type, validate = true) {
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
        const agg = blst.aggregateSignatures(signatures.map(({ sig }) => sig));
        return new Signature(agg);
    }
    static verifyMultipleSignatures(sets) {
        return blst.verifyMultipleAggregateSignatures(sets.map((s) => ({ message: s.message, publicKey: s.publicKey.key, signature: s.signature.sig })));
    }
    verify(publicKey, message) {
        // Individual infinity signatures are NOT okay. Aggregated signatures MAY be infinity
        if (this.sig.isInfinity()) {
            throw new ZeroSignatureError();
        }
        return blst.verify(message, publicKey.key, this.sig);
    }
    verifyAggregate(publicKeys, message) {
        return blst.fastAggregateVerify(message, publicKeys.map((pk) => pk.key), this.sig);
    }
    verifyMultiple(publicKeys, messages) {
        return blst.aggregateVerify(messages, publicKeys.map((pk) => pk.key), this.sig);
    }
    toBytes(format) {
        if (format === PointFormat.uncompressed) {
            return this.sig.serialize(false);
        }
        else {
            return this.sig.serialize(true);
        }
    }
    toHex(format) {
        return bytesToHex(this.toBytes(format));
    }
    aggregateVerify(msgs, pks) {
        // If this set is simply an infinity signature and infinity publicKey then skip verification.
        // This has the effect of always declaring that this sig/publicKey combination is valid.
        // for Eth2.0 specs tests
        if (this.sig.isInfinity() && pks.length === 1 && pks[0].isInfinity()) {
            return true;
        }
        return blst.aggregateVerify(msgs, pks, this.sig);
    }
}
