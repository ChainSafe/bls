#pragma once

#include <openssl/rand.h>

#include <algorithm>
#include <iostream>
#include <memory>
#include <optional>
#include <string>
#include <string_view>

#include "blst.hpp"
#include "napi.h"

namespace blst_ts {
#define BLST_TS_RANDOM_BYTES_LENGTH 8U

#define BLST_TS_FUNCTION_PREAMBLE(info, env, module)                           \
    Napi::Env env = info.Env();                                                \
    Napi::EscapableHandleScope scope(env);                                     \
    BlstTsAddon *module = env.GetInstanceData<BlstTsAddon>();

#define BLST_TS_SERIALIZE_POINT(snake_case_name)                               \
    Napi::Env env = info.Env();                                                \
    Napi::EscapableHandleScope scope(env);                                     \
    bool compressed{true};                                                     \
    if (!info[0].IsUndefined()) {                                              \
        compressed = info[0].ToBoolean().Value();                              \
    }                                                                          \
    Napi::Buffer<uint8_t> serialized = Napi::Buffer<uint8_t>::New(             \
        env,                                                                   \
        compressed ? snake_case_name##_length_compressed                       \
                   : snake_case_name##_length_uncompressed);                   \
    point->Serialize(compressed, serialized.Data());                           \
    return scope.Escape(serialized);

#define BLST_TS_UNWRAP_UINT_8_ARRAY(value_name, arr_name, js_name)             \
    if (!value_name.IsTypedArray()) {                                          \
        Napi::TypeError::New(                                                  \
            env, "BLST_ERROR: " js_name " must be a BlstBuffer")               \
            .ThrowAsJavaScriptException();                                     \
        return env.Undefined();                                                \
    }                                                                          \
    Napi::TypedArray arr_name##_array = value_name.As<Napi::TypedArray>();     \
    if (arr_name##_array.TypedArrayType() != napi_uint8_array) {               \
        Napi::TypeError::New(                                                  \
            env, "BLST_ERROR: " js_name " must be a BlstBuffer")               \
            .ThrowAsJavaScriptException();                                     \
        return env.Undefined();                                                \
    }                                                                          \
    Napi::Uint8Array arr_name =                                                \
        arr_name##_array.As<Napi::TypedArrayOf<uint8_t>>();

#define BLST_TS_CLASS_UNWRAP_UINT_8_ARRAY(value_name, arr_name, js_name)       \
    if (!value_name.IsTypedArray()) {                                          \
        Napi::TypeError::New(                                                  \
            env, "BLST_ERROR: " js_name " must be a BlstBuffer")               \
            .ThrowAsJavaScriptException();                                     \
        has_error = true;                                                      \
        return;                                                                \
    }                                                                          \
    Napi::TypedArray arr_name##_array = value_name.As<Napi::TypedArray>();     \
    if (arr_name##_array.TypedArrayType() != napi_uint8_array) {               \
        Napi::TypeError::New(                                                  \
            env, "BLST_ERROR: " js_name " must be a BlstBuffer")               \
            .ThrowAsJavaScriptException();                                     \
        has_error = true;                                                      \
        return;                                                                \
    }                                                                          \
    Napi::Uint8Array arr_name =                                                \
        arr_name##_array.As<Napi::TypedArrayOf<uint8_t>>();

typedef enum { Affine, Jacobian } CoordType;

/**
 * Checks if a specified range of bytes within a byte array consists only of
 * zeros.
 *
 * @param data A pointer to the first element of the byte array to be checked.
 * @param starting_index The offset (index) from the beginning of the array
 * where the check should start. (0 starts at *data)
 * @param byte_length The total length of the data array
 *
 * @return Returns true if all bytes from start_byte to the end of the array are
 * zeros. Returns false if the starting offset is beyond the array length or if
 * any byte in the specified range is not zero.
 */
bool is_zero_bytes(
    const uint8_t *data,
    const size_t start_byte,
    const size_t byte_length) noexcept;

/**
 * Validates that a given byte length matches one of two specified lengths,
 * returning an optional error message if the validation fails.
 *
 * @param byte_length The length to be validated against length1 and length2.
 * @param length1 The first valid length that byte_length can be. A value of 0
 * is considered as not set and thus not compared.
 * @param length2 The second valid length that byte_length can be. A value of 0
 * is considered as not set and thus not compared.
 *
 * @return An std::optional<std::string> that contains an error message if
 * byte_length does not match either length1 or (if length2 is not 0) length2.
 * If byte_length is valid, std::nullopt is returned. The error message, if
 * returned, specifies the valid lengths byte_length must match.
 *
 * @note If both length1 and length2 are provided (non-zero), and byte_length
 * does not match, the error message indicates that the valid byte_length must
 * be either length1 or length2. If only one length is provided (the other being
 * 0), the error message will only reference the provided length. This function
 * is marked with [[nodiscard]] to ensure that the caller handles the potential
 * error message, promoting safer and more intentional error checking.
 */
[[nodiscard]] std::optional<std::string> is_valid_length(
    size_t byte_length, size_t length1, size_t length2 = 0) noexcept;
}  // namespace blst_ts

class BlstTsAddon;
/**
 * Circular dependency if these are moved up to the top of the file.
 */
#include "public_key.h"
#include "secret_key.h"
#include "signature.h"
namespace blst_ts_functions {
void init(const Napi::Env &env, Napi::Object &exports);
}

/**
 * BlstTsAddon is the main entry point for the library. It is responsible
 * for initialization and holding global values.
 */
class BlstTsAddon : public Napi::Addon<BlstTsAddon> {
   private:
    std::string _blst_error_strings[8];

   public:
    std::string dst;
    Napi::FunctionReference secret_key_ctr;
    Napi::FunctionReference public_key_ctr;
    Napi::FunctionReference signature_ctr;

    /**
     * BlstTsAddon::BlstTsAddon constructor used by Node.js to create an
     * instance of the addon.
     *
     * @param env Napi::Env
     * @param exports Napi::Object
     *
     * @return BlstTsAddon
     *
     * @throws Napi::Error
     */
    BlstTsAddon(Napi::Env env, Napi::Object exports);

    /**
     * References are by default non-copyable and non-movable. This is just
     * to make it explicit that it's not allowed to be copied or moved.
     */
    BlstTsAddon(BlstTsAddon &&source) = delete;
    BlstTsAddon(const BlstTsAddon &source) = delete;
    BlstTsAddon &operator=(BlstTsAddon &&source) = delete;
    BlstTsAddon &operator=(const BlstTsAddon &source) = delete;

    /**
     * Converts a blst error to an error string
     */
    std::string GetBlstErrorString(const blst::BLST_ERROR &err);

    /**
     * Uses the same openssl method as node to generate random bytes
     *
     * Either succeeds with exactly |length| bytes of cryptographically
     * strong pseudo-random data, or fails. This function may block.
     * Don't assume anything about the contents of |buffer| on error.
     * MUST check the return value for success!
     *
     * As a special case, |length == 0| can be used to check if the
     * GetRandomBytes is properly seeded without consuming entropy.
     */
    bool GetRandomBytes(blst::byte *ikm, size_t length);
};
