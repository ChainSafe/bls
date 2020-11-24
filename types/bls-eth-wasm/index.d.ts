declare module "bls-eth-wasm" {
    export class Common {

        constructor(size: number);
    
        deserializeHexStr(s: string): void;
    
        serializeToHexStr(): string;
    
        dump(msg?: string): string;
    
        clear(): void;
    
        clone(): this;
    
        isEqual(rhs: this): boolean
    
        deserialize(v: Uint8Array): void;
    
        serialize(): Uint8Array;
    
        add(rhs: this): void;
    }
    
    export class SecretKeyType extends Common {
    
        constructor();
    
        setInt(x: number): void;
    
        setHashOf(a: Uint8Array): void;
    
        setLittleEndian(a: Uint8Array): void;
    
        setByCSPRNG(): void;
    
        getPublicKey(): PublicKeyType;
    
        sign(m: string | Uint8Array): SignatureType;
    
        /**
         *
         * @param m must have 40 bytes
         */
        signHashWithDomain(m: Uint8Array): SignatureType;
    }
    
    export class PublicKeyType extends Common {
    
        constructor();
    
        verify(signature: SignatureType, m: Uint8Array | string): boolean;
        isValidOrder(): boolean;
        deserializeUncompressed (s: Uint8Array): void;
        serializeUncompressed (): Uint8Array;
        deserializeUncompressedHexStr (s:string): void;
        serializeUncompressedToHexStr(): string;
        /**
         *
         * @param signature
         * @param m must have 40 bytes
         */
        verifyHashWithDomain(signature: SignatureType, m: Uint8Array): boolean;
    }
    
    export class SignatureType extends Common {
        constructor();
    
        deserializeUncompressed (s: Uint8Array): void;
        serializeUncompressed (): Uint8Array;
        deserializeUncompressedHexStr (s:string): void;
        serializeUncompressedToHexStr(): string;
        isValidOrder(): boolean;
        aggregate(others: SignatureType[]): boolean;
        aggregateVerifyNoCheck(publicKeys: PublicKeyType[], messages: Uint8Array): boolean;
        fastAggregateVerify(publicKeys: PublicKeyType[], message: Uint8Array): boolean;
        /**
         *
         * @param publicKeys
         * @param messages each message must have 40bytes
         */
        verifyAggregatedHashWithDomain(publicKeys: PublicKeyType[], messages: Uint8Array[]): boolean
    
    }
    
    export function init(): Promise<void>;
    
    export function toHex(a: Uint8Array, start: number, length: number): string;
    export function toHexStr(a: Uint8Array): string;
    export function fromHexStr(s: string): Uint8Array;
    export function getCurveOrder(): string;
    export function getFieldOrder(): string;
    export function verifySignatureOrder(doVerify: boolean): void;
    export function verifyPublicKeyOrder(doVerify: boolean): void;
    
    /**
     *
     * @param msgs single array with concatenated messages
     * @param msgSize defaults to MSG_SIZE
     */
    export function areAllMsgDifferent(msgs: Uint8Array, msgSize?: number): boolean;
    export function shouldVerifyBlsSignatureOrder(b: string): void;
    export function shouldVerifyBlsPublicKeyOrder(b: string): void;
    export function deserializeHexStrToSecretKey(s: string): SecretKeyType;
    export function deserializeHexStrToPublicKey(s: string): PublicKeyType;
    export function deserializeHexStrToSignature(s: string): SignatureType;
    
    export const SecretKey: typeof SecretKeyType;
    export const PublicKey: typeof PublicKeyType;
    export const Signature: typeof SignatureType;
}