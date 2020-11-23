interface ICommon {
  new (): this;

  deserializeHexStr(s: string): void;

  serializeToHexStr(): string;

  isEqual(rhs: this): boolean;

  deserialize(v: Uint8Array): void;

  serialize(): Uint8Array;

  add(rhs: this): void;

  dump(msg?: string): string;

  clear(): void;

  clone(): this;
}

export interface IPrivateKeyValue extends ICommon {
  setInt(x: number): void;

  setHashOf(a: Uint8Array): void;

  setLittleEndian(a: Uint8Array): void;

  setByCSPRNG(): void;

  getPublicKey(): IPublicKeyValue;

  sign(m: string | Uint8Array): ISignatureValue;
}

export interface IPublicKeyValue extends ICommon {
  verify(signature: ISignatureValue, m: Uint8Array | string): boolean;
  isValidOrder(): boolean;
  deserializeUncompressed(s: Uint8Array): void;
  serializeUncompressed(): Uint8Array;
  deserializeUncompressedHexStr(s: string): void;
  serializeUncompressedToHexStr(): string;
}

export interface ISignatureValue extends ICommon {
  deserializeUncompressed(s: Uint8Array): void;
  serializeUncompressed(): Uint8Array;
  deserializeUncompressedHexStr(s: string): void;
  serializeUncompressedToHexStr(): string;
  isValidOrder(): boolean;
  aggregate(others: ISignatureValue[]): boolean;
  aggregateVerifyNoCheck(publicKeys: IPublicKeyValue[], messages: Uint8Array): boolean;
  fastAggregateVerify(publicKeys: IPublicKeyValue[], message: Uint8Array): boolean;
}

export interface IBls {
  //property names are like that for api compatibility
  SecretKey: InstanceType<IPrivateKeyValue>;
  PublicKey: InstanceType<IPublicKeyValue>;
  Signature: InstanceType<ISignatureValue>;

  toHex(a: Uint8Array, start: number, length: number): string;
  toHexStr(a: Uint8Array): string;
  fromHexStr(s: string): Uint8Array;
  getCurveOrder(): string;
  getFieldOrder(): string;
  verifySignatureOrder(doVerify: boolean): void;
  verifyPublicKeyOrder(doVerify: boolean): void;

  /**
   *
   * @param msgs single array with concatenated messages
   * @param msgSize defaults to MSG_SIZE
   */
  areAllMsgDifferent(msgs: Uint8Array, msgSize?: number): boolean;
  shouldVerifyBlsSignatureOrder(b: string): void;
  shouldVerifyBlsPublicKeyOrder(b: string): void;
  deserializeHexStrToSecretKey(s: string): IPrivateKeyValue;
  deserializeHexStrToPublicKey(s: string): IPublicKeyValue;
  deserializeHexStrToSignature(s: string): ISignatureValue;

  init(): Promise<this>;
  destroy(): void;
}
