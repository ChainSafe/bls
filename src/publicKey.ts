import * as blst from "@chainsafe/blst-ts";
import {blst as blstBindings} from "@chainsafe/blst-ts/dist/bindings";
import {Signature} from "./signature";
import {bytesToHex, hexToBytes} from "./helpers/utils";

export class PublicKey {
  readonly affine: blst.PublicKey;
  readonly jacobian: blst.AggregatePublicKey;

  constructor(affine: blst.PublicKey, jacobian: blst.AggregatePublicKey) {
    this.affine = affine;
    this.jacobian = jacobian;
  }

  static fromBytes(bytes: Uint8Array): PublicKey {
    const affine = blst.PublicKey.fromBytes(bytes);
    const jacobian = blst.AggregatePublicKey.fromPublicKey(affine);
    return new PublicKey(affine, jacobian);
  }

  static fromHex(hex: string): PublicKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(pubkeys: PublicKey[]): PublicKey {
    const p1Arr = pubkeys.map((pk) => pk.jacobian.value);
    const aggP1 = p1Arr.reduce((_agg, pk) => {
      return blstBindings.P1.add(_agg, pk);
    });

    const jacobian = new blst.AggregatePublicKey(aggP1);
    const affine = jacobian.toPublicKey();
    return new PublicKey(affine, jacobian);
  }

  verifyMessage(signature: Signature, message: Uint8Array): boolean {
    return blst.verify(message, this.affine, signature.value);
  }

  toBytes(): Buffer {
    return Buffer.from(this.affine.toBytes());
  }

  toHex(): string {
    return bytesToHex(this.toBytes());
  }
}
