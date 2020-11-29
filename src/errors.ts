/**
 * Indicate that this error is expected and should not be ignored
 * by the functional interface try / catch blocks
 */
export class ExpectedError extends Error {}

export class ZeroPrivateKeyError extends Error {
  constructor() {
    super("PRIVATE_KEY_IS_ZERO");
  }
}

export class ZeroPublicKeyError extends Error {
  constructor() {
    super("PUBLIC_KEY_IS_ZERO");
  }
}
