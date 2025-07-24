import {expose} from "@chainsafe/threads/worker";
import {Implementation} from "../../../../src/types.js";
import bls, {init} from "../../../../src/switchable.js";

export type WorkerApi = typeof workerApi;

const workerApi = {
  async verify(impl: Implementation, publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array) {
    await init(impl);
    const pk = bls.PublicKey.fromBytes(publicKey);
    const sig = bls.Signature.fromBytes(signature);
    return sig.verify(pk, message);
  },
  async verifyMultipleAggregateSignatures(
    impl: Implementation,
    sets: {publicKey: Uint8Array; message: Uint8Array; signature: Uint8Array}[]
  ) {
    await init(impl);
    return bls.Signature.verifyMultipleSignatures(
      sets.map((s) => ({
        publicKey: bls.PublicKey.fromBytes(s.publicKey),
        message: s.message,
        signature: bls.Signature.fromBytes(s.signature),
      }))
    );
  },
};

expose(workerApi);
