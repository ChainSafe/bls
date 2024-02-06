#ifndef BLST_TS_ADDON_H__
#define BLST_TS_ADDON_H__

#include <openssl/rand.h>

#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <string_view>

#include "blst.hpp"
#include "napi.h"

// TODO: these should come out post PR review
using std::cout;
using std::endl;

#define BLST_TS_RANDOM_BYTES_LENGTH 8U

#define BLST_TS_FUNCTION_PREAMBLE(info, env, module)                           \
    Napi::Env env = info.Env();                                                \
    Napi::EscapableHandleScope scope(env);                                     \
    BlstTsAddon *module = env.GetInstanceData<BlstTsAddon>();

#define BLST_TS_IS_INFINITY                                                \
    Napi::Env env = info.Env();                                                \
    Napi::EscapableHandleScope scope(env);                                     \
    return scope.Escape(Napi::Boolean::New(env, _point->IsInfinite()));

#define BLST_TS_SERIALIZE_POINT(macro_name)                                \
    Napi::Env env = info.Env();                                                \
    Napi::EscapableHandleScope scope(env);                                     \
    bool compressed{true};                                                     \
    if (!info[0].IsUndefined()) {                                              \
        compressed = info[0].ToBoolean().Value();                              \
    }                                                                          \
    Napi::Buffer<uint8_t> serialized = Napi::Buffer<uint8_t>::New(             \
        env,                                                                   \
        compressed ? BLST_TS_##macro_name##_LENGTH_COMPRESSED                  \
                   : BLST_TS_##macro_name##_LENGTH_UNCOMPRESSED);              \
    _point->Serialize(compressed, serialized.Data());                          \
    return scope.Escape(serialized);

#define BLST_TS_UNWRAP_UINT_8_ARRAY(value_name, arr_name, js_name)         \
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

#define BLST_TS_CLASS_UNWRAP_UINT_8_ARRAY(value_name, arr_name, js_name)   \
    if (!value_name.IsTypedArray()) {                                          \
        Napi::TypeError::New(                                                  \
            env, "BLST_ERROR: " js_name " must be a BlstBuffer")               \
            .ThrowAsJavaScriptException();                                     \
        m_has_error = true;                                                    \
        return;                                                                \
    }                                                                          \
    Napi::TypedArray arr_name##_array = value_name.As<Napi::TypedArray>();     \
    if (arr_name##_array.TypedArrayType() != napi_uint8_array) {               \
        Napi::TypeError::New(                                                  \
            env, "BLST_ERROR: " js_name " must be a BlstBuffer")               \
            .ThrowAsJavaScriptException();                                     \
        m_has_error = true;                                                    \
        return;                                                                \
    }                                                                          \
    Napi::Uint8Array arr_name =                                                \
        arr_name##_array.As<Napi::TypedArrayOf<uint8_t>>();

class BlstTsAddon;

typedef enum { Affine, Jacobian } CoordType;

/**
 * Checks a byte array to see if it is all zeros. Can pass start byte for the
 * cases where the first byte is the tag (infinity point and
 * compress/uncompressed).
 *
 * @param data uint8_t*
 * @param start_byte size_t
 * @param byte_length size_t
 *
 * @return bool
 */
bool is_zero_bytes(
    const uint8_t *data, const size_t start_byte, const size_t byte_length);

/**
 * Checks if a byte array is a valid length. If not, sets the error message and
 * returns false.  If valid returns true for use in conditional statements.
 *
 * @param[out] error_out &std::string - error message to set if invalid
 * @param[in] byte_length size_t - length of the byte array to validate
 * @param[in] length1 size_t - first valid length
 * @param[in] length2 size_t - second valid length (optional)
 *
 * @return bool
 */
bool is_valid_length(
    std::string &error_out,
    size_t byte_length,
    size_t length1,
    size_t length2 = 0);

/**
 * Circular dependency if these are moved up to the top of the file.
 */
#include "functions.h"
#include "public_key.h"
#include "secret_key.h"
#include "signature.h"

/**
 * BlstTsAddon is the main entry point for the library. It is responsible
 * for initialization and holding global values.
 */
class BlstTsAddon : public Napi::Addon<BlstTsAddon> {
   public:
    std::string _dst;
    std::string _blst_error_strings[8];
    Napi::FunctionReference _secret_key_ctr;
    Napi::FunctionReference _public_key_ctr;
    Napi::FunctionReference _signature_ctr;

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

#endif /* BLST_TS_ADDON_H__ */
