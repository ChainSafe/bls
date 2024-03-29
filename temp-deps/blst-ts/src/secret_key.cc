#include "secret_key.h"

using namespace std::string_literals;

namespace blst_ts {
void SecretKey::Init(
    Napi::Env env, Napi::Object &exports, BlstTsAddon *module) {
    Napi::HandleScope scope(env);
    std::initializer_list<Napi::ClassPropertyDescriptor<SecretKey>> proto = {
        StaticMethod(
            "fromKeygen",
            &SecretKey::FromKeygen,
            static_cast<napi_property_attributes>(
                napi_static | napi_enumerable)),
        StaticMethod(
            "deserialize",
            &SecretKey::Deserialize,
            static_cast<napi_property_attributes>(
                napi_static | napi_enumerable)),
        InstanceMethod(
            "serialize",
            &SecretKey::Serialize,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "toPublicKey",
            &SecretKey::ToPublicKey,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "sign",
            &SecretKey::Sign,
            static_cast<napi_property_attributes>(napi_enumerable)),
    };

    Napi::Function ctr = DefineClass(env, "SecretKey", proto, module);
    module->secret_key_ctr = Napi::Persistent(ctr);
    exports.Set(Napi::String::New(env, "SecretKey"), ctr);

    exports.Get("BLST_CONSTANTS")
        .As<Napi::Object>()
        .Set(
            Napi::String::New(env, "SECRET_KEY_LENGTH"),
            Napi::Number::New(env, secret_key_length));
}

Napi::Value SecretKey::FromKeygen(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    Napi::Value ikm_value = info[0];
    Napi::Value info_value = info[1];

    BLST_TS_UNWRAP_UINT_8_ARRAY(ikm_value, ikm, "ikm")
    // Check for less than 32 bytes so consumers don't accidentally create
    // zero keys
    if (ikm.ByteLength() < secret_key_length) {
        Napi::TypeError::New(
            env,
            "ikm must be greater than or equal to "s +
                std::to_string(secret_key_length) + " bytes"s)
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    // just need to pass some value to the External constructor. debug builds
    // have hard crash check for nullptr
    bool is_external = true;
    Napi::Object wrapped = module->secret_key_ctr.New(
        {Napi::External<bool>::New(env, &is_external)});
    SecretKey *sk = SecretKey::Unwrap(wrapped);

    // If `info` string is passed use it otherwise use default without
    if (!info_value.IsUndefined()) {
        if (!info_value.IsString()) {
            Napi::TypeError::New(env, "BLST_ERROR: info must be a string")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        sk->key->keygen(
            ikm.Data(),
            ikm.ByteLength(),
            info_value.As<Napi::String>().Utf8Value());
    } else {
        sk->key->keygen(ikm.Data(), ikm.ByteLength());
    }

    // Check if key is zero and set flag if so. Several specs depend on this
    // check (signing with zero key). Do after building instead of checking
    // incoming bytes incase info changes the key
    blst::byte key_bytes[secret_key_length];

    sk->key->to_bendian(key_bytes);
    sk->is_zero_key = blst_ts::is_zero_bytes(key_bytes, 0, secret_key_length);

    return scope.Escape(wrapped);
}

Napi::Value SecretKey::Deserialize(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)

    Napi::Value sk_bytes_value = info[0];
    BLST_TS_UNWRAP_UINT_8_ARRAY(sk_bytes_value, sk_bytes, "skBytes")
    if (std::optional<std::string> err_msg = blst_ts::is_valid_length(
            sk_bytes.ByteLength(), secret_key_length)) {
        Napi::TypeError::New(env, "BLST_ERROR: skBytes"s + *err_msg)
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    // just need to pass some value to the External constructor. debug builds
    // have hard crash check for nullptr
    bool is_external = true;
    Napi::Object wrapped = module->secret_key_ctr.New(
        {Napi::External<bool>::New(env, &is_external)});
    SecretKey *sk = SecretKey::Unwrap(wrapped);

    // Check if key is zero and set flag if so. Several specs depend on this
    // check (signing with zero key)
    sk->is_zero_key =
        blst_ts::is_zero_bytes(sk_bytes.Data(), 0, sk_bytes.ByteLength());

    // Deserialize key
    sk->key->from_bendian(sk_bytes.Data());

    return scope.Escape(wrapped);
}

SecretKey::SecretKey(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<SecretKey>{info},
      key{std::make_unique<blst::SecretKey>()},
      is_zero_key{false} {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    // Check that constructor was called from C++ and not JS. Externals can only
    // be created natively.
    if (!info[0].IsExternal()) {
        Napi::Error::New(env, "SecretKey constructor is private")
            .ThrowAsJavaScriptException();
    }
}

Napi::Value SecretKey::Serialize(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::EscapableHandleScope scope(env);

    Napi::Buffer<uint8_t> serialized =
        Napi::Buffer<uint8_t>::New(env, secret_key_length);
    key->to_bendian(serialized.Data());

    return scope.Escape(serialized);
}

Napi::Value SecretKey::ToPublicKey(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    return scope.Escape(module->public_key_ctr.New(
        {Napi::External<P1Wrapper>::New(env, new P1{blst::P1{*key}}),
         Napi::Boolean::New(env, false)}));
}

Napi::Value SecretKey::Sign(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    // Check for zero key and throw error to meet spec requirements
    if (is_zero_key) {
        Napi::TypeError::New(
            env, "BLST_ERROR: cannot sign message with zero private key")
            .ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }

    Napi::Value msg_value = info[0];
    BLST_TS_UNWRAP_UINT_8_ARRAY(msg_value, msg, "msg")

    Napi::Object sig_obj = module->signature_ctr.New(
        // Default to jacobian coordinates
        {Napi::External<P2Wrapper>::New(env, new P2{blst::P2{}}),
         Napi::Boolean::New(env, false)});
    Signature *sig = Napi::ObjectWrap<Signature>::Unwrap(sig_obj);
    sig->point->Sign(*key, msg.Data(), msg.ByteLength(), module->dst);

    return scope.Escape(sig_obj);
}
}  // namespace blst_ts
