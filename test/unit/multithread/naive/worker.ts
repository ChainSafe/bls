import {expose} from "@chainsafe/threads/worker";
import {CoordType, Implementation} from "../../../../src/types.js";
import bls, {init} from "../../../../src/switchable.js";

export type WorkerApi = typeof workerApi;

const workerApi = {
  async verify(impl: Implementation, publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array) {
    await init(impl);
    const pk = bls.PublicKey.fromBytes(publicKey, CoordType.affine);
    const sig = bls.Signature.fromBytes(signature, CoordType.affine, true);
    return sig.verify(pk, message);
  },
  async verifyMultipleAggregateSignatures(
    impl: Implementation,
    sets: {publicKey: Uint8Array; message: Uint8Array; signature: Uint8Array}[]
  ) {
    await init(impl);
    return bls.Signature.verifyMultipleSignatures(
      sets.map((s) => ({
        publicKey: bls.PublicKey.fromBytes(s.publicKey, CoordType.affine),
        message: s.message,
        signature: bls.Signature.fromBytes(s.signature, CoordType.affine, true),
      }))
    );
  },
};

expose(workerApi);
