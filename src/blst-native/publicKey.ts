import * as blst from "../../temp-deps/blst-ts/lib/index.js";
import {EmptyAggregateError} from "../errors.js";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {PointFormat, PublicKey as IPublicKey, CoordType} from "../types.js";

export class PublicKey implements IPublicKey {
  private constructor(private readonly key: blst.PublicKey) {}

  /** @param type Defaults to `CoordType.jacobian` */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate?: boolean): PublicKey {
    const pk = blst.PublicKey.deserialize(bytes, type);
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

    const pk = blst.aggregatePublicKeys(publicKeys.map(({key}) => key));
    return new PublicKey(pk);
  }

  private static friendBuild(key: blst.PublicKey): PublicKey {
    return new PublicKey(key);
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.key.serialize(false);
    } else {
      return this.key.serialize(true);
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }

  multiplyBy(bytes: Uint8Array): PublicKey {
    return new PublicKey(this.key.multiplyBy(bytes));
  }
}
