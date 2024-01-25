/**
 * This error should not be ignored by the functional interface
 * try / catch blocks, to prevent false negatives
 */
export class NotInitializedError extends Error {
    constructor(implementation) {
        super(`NOT_INITIALIZED: ${implementation}`);
    }
}
export class ZeroSecretKeyError extends Error {
    constructor() {
        super("ZERO_SECRET_KEY");
    }
}
export class ZeroPublicKeyError extends Error {
    constructor() {
        super("ZERO_PUBLIC_KEY");
    }
}
export class ZeroSignatureError extends Error {
    constructor() {
        super("ZERO_SIGNATURE");
    }
}
export class EmptyAggregateError extends Error {
    constructor() {
        super("EMPTY_AGGREGATE_ARRAY");
    }
}
export class InvalidOrderError extends Error {
    constructor() {
        super("INVALID_ORDER");
    }
}
export class InvalidLengthError extends Error {
    constructor(arg, length) {
        super(`INVALID_LENGTH: ${arg} - ${length} bytes`);
    }
}
