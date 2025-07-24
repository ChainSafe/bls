import blst from "@chainsafe/blst";
import {EmptyAggregateError} from "../errors.js";
import {bytesToHex, hexToBytes} from "../helpers/index.js";
import {CoordType, PointFormat, PublicKey as IPublicKey, PublicKeyArg} from "../types.js";

export class PublicKey implements IPublicKey {
  private constructor(private readonly value: blst.PublicKey) {}

  /** @param type Defaults to `CoordType.jacobian` */
  static fromBytes(bytes: Uint8Array, type?: CoordType, validate = true): PublicKey {
    // need to hack the CoordType so @chainsafe/blst is not a required dep
    const pk = blst.PublicKey.fromBytes(bytes, validate);
    return new PublicKey(pk);
  }

  static fromHex(hex: string): PublicKey {
    return this.fromBytes(hexToBytes(hex));
  }

  static aggregate(publicKeys: PublicKeyArg[]): PublicKey {
    if (publicKeys.length === 0) {
      throw new EmptyAggregateError();
    }

    const pk = blst.aggregatePublicKeys(publicKeys.map(PublicKey.convertToBlstPublicKeyArg));
    return new PublicKey(pk);
  }

  static convertToBlstPublicKeyArg(publicKey: PublicKeyArg): blst.PublicKey {
    // need to cast to blst-native key instead of IPublicKey
    return publicKey instanceof Uint8Array ? blst.PublicKey.fromBytes(publicKey) : (publicKey as PublicKey).value;
  }

  /**
   * Implemented for SecretKey to be able to call .toPublicKey()
   */
  private static friendBuild(key: blst.PublicKey): PublicKey {
    return new PublicKey(key);
  }

  toBytes(format?: PointFormat): Uint8Array {
    if (format === PointFormat.uncompressed) {
      return this.value.toBytes(false);
    } else {
      return this.value.toBytes(true);
    }
  }

  toHex(format?: PointFormat): string {
    return bytesToHex(this.toBytes(format));
  }

  multiplyBy(_bytes: Uint8Array): PublicKey {
    throw new Error("Not implemented");
  }
}
