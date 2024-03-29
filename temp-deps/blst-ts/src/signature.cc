#include "signature.h"

using namespace std::string_literals;
namespace blst_ts {
void P2::Serialize(bool compress, blst::byte *out) const {
    compress ? _point.compress(out) : _point.serialize(out);
}

P2AffineGroup P2::AsAffine() {
    P2AffineGroup group{std::make_unique<blst::P2_Affine>(_point), nullptr};
    group.raw_point = group.smart_pointer.get();
    return group;
}

blst::P2 P2::MultiplyBy(
    const blst::byte *rand_bytes, const size_t rand_bytes_length) const {
    blst::byte out[signature_length_uncompressed];
    _point.serialize(out);
    // this should get std::move all the way into the P2 member value
    blst::P2 point{out, signature_length_uncompressed};
    point.mult(rand_bytes, rand_bytes_length);
    return point;
}

void P2::Sign(
    const blst::SecretKey &key,
    const uint8_t *msg,
    const size_t msg_length,
    const std::string &dst) {
    _point.hash_to(msg, msg_length, dst);
    _point.sign_with(key);
}

void P2Affine::Serialize(bool compress, blst::byte *out) const {
    compress ? _point.compress(out) : _point.serialize(out);
}

P2AffineGroup P2Affine::AsAffine() {
    P2AffineGroup group{nullptr, &_point};
    return group;
}

blst::P2 P2Affine::MultiplyBy(
    const blst::byte *rand_bytes, const size_t rand_bytes_length) const {
    blst::byte out[signature_length_uncompressed];
    _point.serialize(out);
    // this should get std::move all the way into the P2 member value
    blst::P2 point{out, signature_length_uncompressed};
    point.mult(rand_bytes, rand_bytes_length);
    return point;
}

void P2Affine::Sign(
    const blst::SecretKey &key,
    const uint8_t *msg,
    const size_t msg_length,
    const std::string &dst) {
    blst::P2 jacobian{_point};
    jacobian.hash_to(msg, msg_length, dst);
    jacobian.sign_with(key);
    _point = jacobian.to_affine();
}

void Signature::Init(
    Napi::Env env, Napi::Object &exports, BlstTsAddon *module) {
    Napi::HandleScope scope(
        env);  // no need to Escape, Persistent will take care of it
    std::initializer_list<Napi::ClassPropertyDescriptor<Signature>> proto = {
        StaticMethod(
            "deserialize",
            &Signature::Deserialize,
            static_cast<napi_property_attributes>(
                napi_static | napi_enumerable)),
        InstanceMethod(
            "serialize",
            &Signature::Serialize,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "sigValidate",
            &Signature::SigValidate,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "isInfinity",
            &Signature::IsInfinity,
            static_cast<napi_property_attributes>(napi_enumerable)),
        InstanceMethod(
            "multiplyBy",
            &Signature::MultiplyBy,
            static_cast<napi_property_attributes>(napi_enumerable)),
    };

    Napi::Function ctr = DefineClass(env, "Signature", proto, module);
    module->signature_ctr = Napi::Persistent(ctr);
    exports.Set(Napi::String::New(env, "Signature"), ctr);

    Napi::Object js_exports = exports.Get("BLST_CONSTANTS").As<Napi::Object>();
    js_exports.Set(
        Napi::String::New(env, "SIGNATURE_LENGTH_COMPRESSED"),
        Napi::Number::New(env, signature_length_compressed));
    js_exports.Set(
        Napi::String::New(env, "SIGNATURE_LENGTH_UNCOMPRESSED"),
        Napi::Number::New(env, signature_length_uncompressed));
}

Napi::Value Signature::Deserialize(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    Napi::Value sig_bytes_val = info[0];
    BLST_TS_UNWRAP_UINT_8_ARRAY(sig_bytes_val, sig_bytes, "sigBytes")

    if (std::optional<std::string> err_msg = blst_ts::is_valid_length(
            sig_bytes.ByteLength(),
            signature_length_compressed,
            signature_length_uncompressed)) {
        Napi::TypeError::New(env, "BLST_ERROR: sigBytes"s + *err_msg)
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
                module->signature_ctr.New({Napi::External<P2Wrapper>::New(
                    env,
                    new P2Affine{blst::P2_Affine{
                        sig_bytes.Data(), sig_bytes.ByteLength()}})}));
        }
        return scope.Escape(
            module->signature_ctr.New({Napi::External<P2Wrapper>::New(
                env,
                new P2{blst::P2{sig_bytes.Data(), sig_bytes.ByteLength()}})}));
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

Signature::Signature(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Signature>{info}, point{nullptr} {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    // Check that constructor was called from C++ and not JS. Externals can only
    // be created natively.
    if (!info[0].IsExternal()) {
        Napi::Error::New(env, "Signature constructor is private")
            .ThrowAsJavaScriptException();
        return;
    }
    point.reset(info[0].As<Napi::External<P2Wrapper>>().Data());
}

Napi::Value Signature::Serialize(const Napi::CallbackInfo &info){
    BLST_TS_SERIALIZE_POINT(signature)}

Napi::Value Signature::SigValidate(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (!point->InGroup()) {
        Napi::Error::New(env, "BLST_ERROR::BLST_POINT_NOT_IN_GROUP")
            .ThrowAsJavaScriptException();
    }
    return env.Undefined();
}

Napi::Value Signature::IsInfinity(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::EscapableHandleScope scope(env);
    return scope.Escape(Napi::Boolean::New(env, point->IsInfinite()));
}

Napi::Value Signature::MultiplyBy(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    Napi::Value rand_bytes_value = info[0];
    BLST_TS_UNWRAP_UINT_8_ARRAY(rand_bytes_value, rand_bytes, "randomBytes")

    Napi::Object sig_obj = module->signature_ctr.New(
        // Default to jacobian coordinates
        {Napi::External<P2Wrapper>::New(
             env,
             new P2{point->MultiplyBy(
                 rand_bytes.Data(), rand_bytes.ByteLength())}),
         Napi::Boolean::New(env, false)});

    return scope.Escape(sig_obj);
}
}  // namespace blst_ts
