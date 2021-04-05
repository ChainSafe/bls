import * as blst from "@chainsafe/blst";
import {EmptyAggregateError} from "../errors";
import {bytesToHex, hexToBytes} from "../helpers";
import {PointFormat, PublicKey as IPublicKey} from "../interface";

export class PublicKey extends blst.PublicKey implements IPublicKey {
  constructor(value: ConstructorParameters<typeof blst.PublicKey>[0]) {
    super(value);
  }

  /** @param type Defaults to `CoordType.jacobian` */
  static fromBytes(bytes: Uint8Array, type?: blst.CoordType, validate?: boolean): PublicKey {
    const pk = blst.PublicKey.fromBytes(bytes, type);
    if (validate) pk.keyValidate();
    return new PublicKey(pk.value);
  }

  static fromHex(hex: string): PublicKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(publicKeys: PublicKey[]): PublicKey {
    if (publicKeys.length === 0) {
      throw new EmptyAggregateError();
    }

    const pk = blst.aggregatePubkeys(publicKeys);
    return new PublicKey(pk.value);
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.value.serialize();
    } else {
      return this.value.compress();
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }
}
