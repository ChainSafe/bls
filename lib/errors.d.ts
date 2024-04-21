/**
 * This error should not be ignored by the functional interface
 * try / catch blocks, to prevent false negatives
 */
export declare class NotInitializedError extends Error {
    constructor(implementation: string);
}
export declare class ZeroSecretKeyError extends Error {
    constructor();
}
export declare class ZeroPublicKeyError extends Error {
    constructor();
}
export declare class ZeroSignatureError extends Error {
    constructor();
}
export declare class EmptyAggregateError extends Error {
    constructor();
}
export declare class InvalidOrderError extends Error {
    constructor();
}
export declare class InvalidLengthError extends Error {
    constructor(arg: string, length: number);
}
