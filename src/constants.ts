export const SECRET_KEY_LENGTH = 32;
export const SIGNATURE_LENGTH = 96;
export const FP_POINT_LENGTH = 48;
export const PUBLIC_KEY_LENGTH = FP_POINT_LENGTH;
export const G2_HASH_PADDING = 16;
export const EMPTY_PUBLIC_KEY = new Uint8Array(PUBLIC_KEY_LENGTH);
export const EMPTY_SIGNATURE = new Uint8Array(SIGNATURE_LENGTH);
