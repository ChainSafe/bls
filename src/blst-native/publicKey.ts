import blst from "@chainsafe/blst";
import {EmptyAggregateError} from "../errors.js";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {CoordType, PointFormat, PublicKey as IPublicKey} from "../types.js";

export class PublicKey implements IPublicKey {
  private constructor(private readonly value: blst.PublicKey) {}

  /** @param type Defaults to `CoordType.jacobian` */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate = true): PublicKey {
    // need to hack the CoordType so @chainsafe/blst is not a required dep
    const pk = blst.PublicKey.deserialize(bytes, (type as unknown) as blst.CoordType);
    if (validate) pk.keyValidate();
    return new PublicKey(pk);
  }

  static fromHex(hex: string): PublicKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(publicKeys: PublicKey[]): PublicKey {
    if (publicKeys.length === 0) {
      throw new EmptyAggregateError();
    }

    const pk = blst.aggregatePublicKeys(publicKeys.map(({value}) => value));
    return new PublicKey(pk);
  }

  /**
   * Implemented for SecretKey to be able to call .toPublicKey()
   */
  private static friendBuild(key: blst.PublicKey): PublicKey {
    return new PublicKey(key);
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.value.serialize(false);
    } else {
      return this.value.serialize(true);
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }

  multiplyBy(bytes: Uint8Array): PublicKey {
    return new PublicKey(this.value.multiplyBy(bytes));
  }
}
