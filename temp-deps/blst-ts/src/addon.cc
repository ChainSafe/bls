#include "addon.h"

namespace blst_ts {
bool is_zero_bytes(
    const uint8_t *data,
    const size_t starting_index,
    const size_t byte_length) noexcept {
    if (starting_index < byte_length) {
        return std::all_of(
            data + starting_index, data + byte_length, [](uint8_t x) {
                return x == 0x00;
            });
    }
    return false;
}

[[nodiscard]] std::optional<std::string> is_valid_length(
    size_t byte_length, size_t length1, size_t length2) noexcept {
    if (byte_length == length1 || (length2 != 0 && byte_length == length2)) {
        return std::nullopt;
    }
    std::string err_msg{" must be "};
    if (length1 != 0) {
        err_msg.append(std::to_string(length1));
    };
    if (length2 != 0) {
        if (length1 != 0) {
            err_msg.append(" or ");
        }
        err_msg.append(std::to_string(length2));
    };
    err_msg.append(" bytes long");
    return err_msg;
}
}  // namespace blst_ts

BlstTsAddon::BlstTsAddon(Napi::Env env, Napi::Object exports)
    : _blst_error_strings{
        "BLST_SUCCESS",
        "BLST_ERROR::BLST_BAD_ENCODING",
        "BLST_ERROR::BLST_POINT_NOT_ON_CURVE",
        "BLST_ERROR::BLST_POINT_NOT_IN_GROUP",
        "BLST_ERROR::BLST_AGGR_TYPE_MISMATCH",
        "BLST_ERROR::BLST_VERIFY_FAIL",
        "BLST_ERROR::BLST_PK_IS_INFINITY",
        "BLST_ERROR::BLST_BAD_SCALAR",
    },
    dst{"BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_POP_"} {
    Napi::Object js_constants = Napi::Object::New(env);
    js_constants.Set(
        Napi::String::New(env, "DST"), Napi::String::New(env, dst));
    DefineAddon(
        exports,
        {
            InstanceValue("BLST_CONSTANTS", js_constants, napi_enumerable),
        });
    blst_ts::SecretKey::Init(env, exports, this);
    blst_ts::PublicKey::Init(env, exports, this);
    blst_ts::Signature::Init(env, exports, this);
    blst_ts_functions::init(env, exports);
    env.SetInstanceData(this);

    // Check that openssl PRNG is seeded
    blst::byte seed{0};
    if (!this->GetRandomBytes(&seed, 0)) {
        Napi::Error::New(
            env, "BLST_ERROR: Error seeding pseudo-random number generator")
            .ThrowAsJavaScriptException();
    }
}

std::string BlstTsAddon::GetBlstErrorString(const blst::BLST_ERROR &err) {
    size_t err_index = static_cast<size_t>(err);
    // size of total array divided by size of one element minus 1 for 0 index
    // basis
    size_t max_index =
        sizeof(_blst_error_strings) / sizeof(_blst_error_strings[0]) - 1;
    if (err_index > max_index) {
        return "BLST_ERROR::UNKNOWN_ERROR_CODE";
    }
    return _blst_error_strings[err];
}

bool BlstTsAddon::GetRandomBytes(blst::byte *bytes, size_t length) {
    // [randomBytes](https://github.com/nodejs/node/blob/4166d40d0873b6d8a0c7291872c8d20dc680b1d7/lib/internal/crypto/random.js#L98)
    // [RandomBytesJob](https://github.com/nodejs/node/blob/4166d40d0873b6d8a0c7291872c8d20dc680b1d7/lib/internal/crypto/random.js#L139)
    // [RandomBytesTraits::DeriveBits](https://github.com/nodejs/node/blob/4166d40d0873b6d8a0c7291872c8d20dc680b1d7/src/crypto/crypto_random.cc#L65)
    // [CSPRNG](https://github.com/nodejs/node/blob/4166d40d0873b6d8a0c7291872c8d20dc680b1d7/src/crypto/crypto_util.cc#L63)
    do {
        if ((1 == RAND_status()) && (1 == RAND_bytes(bytes, length))) {
            return true;
        }
    } while (1 == RAND_poll());

    return false;
}

NODE_API_ADDON(BlstTsAddon)
