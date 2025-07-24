import blst from "@chainsafe/blst";
import {EmptyAggregateError} from "../errors.js";
import {PublicKey as IPublicKey} from "../types.js";

export class PublicKey implements IPublicKey {
  constructor(private readonly value: blst.PublicKey) {}

  static fromBytes(bytes: Uint8Array, validate = true): PublicKey {
    return new PublicKey(blst.PublicKey.fromBytes(bytes, validate));
  }

  static fromHex(hex: string, validate = true): PublicKey {
    return new PublicKey(blst.PublicKey.fromHex(hex, validate));
  }

  static aggregate(publicKeys: PublicKey[]): PublicKey {
    if (publicKeys.length === 0) {
      throw new EmptyAggregateError();
    }

    const pk = blst.aggregatePublicKeys(publicKeys.map((pk) => (pk as PublicKey).value));
    return new PublicKey(pk);
  }

  toBytes(compress = true): Uint8Array {
    return this.value.toBytes(compress);
  }

  toHex(compress = true): string {
    return this.value.toHex(compress);
  }
}
