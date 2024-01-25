import bls from "bls-eth-wasm";
declare type Bls = typeof bls;
declare global {
    interface Window {
        msCrypto: typeof window["crypto"];
    }
}
export declare function setupBls(): Promise<void>;
export declare function init(): Promise<void>;
export declare function destroy(): void;
export declare function getContext(): Bls;
export {};
