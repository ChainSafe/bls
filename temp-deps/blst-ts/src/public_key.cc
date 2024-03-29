#include "public_key.h"

using namespace std::string_literals;

namespace blst_ts {

void P1::Serialize(bool compress, blst::byte *out) const {
    compress ? _point.compress(out) : _point.serialize(out);
}

P1AffineGroup P1::AsAffine() {
    P1AffineGroup group{std::make_unique<blst::P1_Affine>(_point), nullptr};
    group.raw_point = group.smart_pointer.get();
    return group;
}

blst::P1 P1::MultiplyBy(
    const blst::byte *rand_bytes, const size_t rand_bytes_length) const {
    blst::byte out[public_key_length_uncompressed];
    _point.serialize(out);
    // this should get std::move all the way into the P1 member value
    blst::P1 point{out, public_key_length_uncompressed};
    point.mult(rand_bytes, rand_bytes_length);
    return point;
}

void P1Affine::Serialize(bool compress, blst::byte *out) const {
    compress ? _point.compress(out) : _point.serialize(out);
}

P1AffineGroup P1Affine::AsAffine() {
    P1AffineGroup group{nullptr, &_point};
    return group;
}

blst::P1 P1Affine::MultiplyBy(
    const blst::byte *rand_bytes, const size_t rand_bytes_length) const {
    blst::byte out[public_key_length_uncompressed];
    _point.serialize(out);
    // this should get std::move all the way into the P1 member value
    blst::P1 point{out, public_key_length_uncompressed};
    point.mult(rand_bytes, rand_bytes_length);
    return point;
}

void PublicKey::Init(
    Napi::Env env, Napi::Object &exports, BlstTsAddon *module) {
    Napi::HandleScope scope(env);
    std::initializer_list<Napi::ClassPropertyDescriptor<PublicKey>> proto = {
        StaticMethod(
            "deserialize",
            &PublicKey::Deserialize,
            static_cast<napi_property_attributes>(
                napi_static | napi_enumerable)),
        InstanceMethod(
            "serialize",
            &PublicKey::Serialize,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "keyValidate",
            &PublicKey::KeyValidate,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "isInfinity",
            &PublicKey::IsInfinity,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "multiplyBy",
            &PublicKey::MultiplyBy,
            static_cast<napi_property_attributes>(napi_enumerable)),
    };

    Napi::Function ctr = DefineClass(env, "PublicKey", proto, module);
    module->public_key_ctr = Napi::Persistent(ctr);
    exports.Set(Napi::String::New(env, "PublicKey"), ctr);

    Napi::Object js_exports = exports.Get("BLST_CONSTANTS").As<Napi::Object>();
    js_exports.Set(
        Napi::String::New(env, "PUBLIC_KEY_LENGTH_COMPRESSED"),
        Napi::Number::New(env, public_key_length_compressed));
    js_exports.Set(
        Napi::String::New(env, "PUBLIC_KEY_LENGTH_UNCOMPRESSED"),
        Napi::Number::New(env, public_key_length_uncompressed));
}

Napi::Value PublicKey::Deserialize(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    Napi::Value pk_bytes_val = info[0];
    BLST_TS_UNWRAP_UINT_8_ARRAY(pk_bytes_val, pk_bytes, "pkBytes")

    if (std::optional<std::string> err_msg = blst_ts::is_valid_length(
            pk_bytes.ByteLength(),
            public_key_length_compressed,
            public_key_length_uncompressed)) {
        Napi::TypeError::New(env, "BLST_ERROR: pkBytes"s + *err_msg)
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    bool is_affine = false;
    // but figure out if request for affine
    if (!info[1].IsUndefined()) {
        Napi::Value type_val = info[1].As<Napi::Value>();
        if (!type_val.IsNumber()) {
            Napi::TypeError::New(
                env, "BLST_ERROR: type must be of enum CoordType (number)")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        switch (type_val.As<Napi::Number>().Uint32Value()) {
            case 0:
                is_affine = true;
                break;
            case 1:
                is_affine = false;
                break;
            default:
                Napi::TypeError::New(
                    env,
                    "BLST_ERROR: must be CoordType.affine or "
                    "CoordType.jacobian")
                    .ThrowAsJavaScriptException();
                return env.Undefined();
        }
    }

    // try/catch here because using untrusted bytes for point creation and
    // blst library will throw for invalid points
    try {
        if (is_affine) {
            return scope.Escape(
                module->public_key_ctr.New({Napi::External<P1Wrapper>::New(
                    env,
                    new P1Affine{blst::P1_Affine{
                        pk_bytes.Data(), pk_bytes.ByteLength()}})}));
        }
        return scope.Escape(
            module->public_key_ctr.New({Napi::External<P1Wrapper>::New(
                env,
                new P1{blst::P1{pk_bytes.Data(), pk_bytes.ByteLength()}})}));
    } catch (const blst::BLST_ERROR &err) {
        Napi::RangeError::New(env, module->GetBlstErrorString(err))
            .ThrowAsJavaScriptException();
        return env.Undefined();
    } catch (...) {
        Napi::Error::New(
            env, "BLST_ERROR: Unknown error deserializing PublicKey")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
}

PublicKey::PublicKey(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<PublicKey>{info}, point{nullptr} {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    // Check that constructor was called from C++ and not JS. Externals can only
    // be created natively.
    if (!info[0].IsExternal()) {
        Napi::Error::New(env, "PublicKey constructor is private")
            .ThrowAsJavaScriptException();
        return;
    }
    point.reset(info[0].As<Napi::External<P1Wrapper>>().Data());
}

Napi::Value PublicKey::Serialize(const Napi::CallbackInfo &info){
    BLST_TS_SERIALIZE_POINT(public_key)}

Napi::Value PublicKey::KeyValidate(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (point->IsInfinite()) {
        Napi::Error::New(env, "BLST_ERROR::BLST_PK_IS_INFINITY")
            .ThrowAsJavaScriptException();
    }
    if (!point->InGroup()) {
        Napi::Error::New(env, "BLST_ERROR::BLST_POINT_NOT_IN_GROUP")
            .ThrowAsJavaScriptException();
    }
    return info.Env().Undefined();
}

Napi::Value PublicKey::IsInfinity(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::EscapableHandleScope scope(env);
    return scope.Escape(Napi::Boolean::New(env, point->IsInfinite()));
}

Napi::Value PublicKey::MultiplyBy(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    Napi::Value rand_bytes_value = info[0];
    BLST_TS_UNWRAP_UINT_8_ARRAY(rand_bytes_value, rand_bytes, "randomBytes")

    Napi::Object pk_obj = module->public_key_ctr.New(
        // Default to jacobian coordinates
        {Napi::External<P1Wrapper>::New(
             env,
             new P1{point->MultiplyBy(
                 rand_bytes.Data(), rand_bytes.ByteLength())}),
         Napi::Boolean::New(env, false)});

    return scope.Escape(pk_obj);
}
}  // namespace blst_ts
