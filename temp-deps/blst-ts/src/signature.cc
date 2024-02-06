#include "signature.h"

void Signature::Init(
    Napi::Env env, Napi::Object &exports, BlstTsAddon *module) {
    Napi::HandleScope scope(
        env);  // no need to Escape, Persistent will take care of it
    auto proto = {
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
    };

    Napi::Function ctr = DefineClass(env, "Signature", proto, module);
    module->_signature_ctr = Napi::Persistent(ctr);
    exports.Set(Napi::String::New(env, "Signature"), ctr);

    Napi::Object js_exports = exports.Get("BLST_CONSTANTS").As<Napi::Object>();
    js_exports.Set(
        Napi::String::New(env, "SIGNATURE_LENGTH_COMPRESSED"),
        Napi::Number::New(env, BLST_TS_SIGNATURE_LENGTH_COMPRESSED));
    js_exports.Set(
        Napi::String::New(env, "SIGNATURE_LENGTH_UNCOMPRESSED"),
        Napi::Number::New(env, BLST_TS_SIGNATURE_LENGTH_UNCOMPRESSED));
}

Napi::Value Signature::Deserialize(const Napi::CallbackInfo &info) {
    BLST_TS_FUNCTION_PREAMBLE(info, env, module)
    Napi::Value sig_bytes_val = info[0];
    BLST_TS_UNWRAP_UINT_8_ARRAY(sig_bytes_val, sig_bytes, "sigBytes")

    std::string err_out{"BLST_ERROR: sigBytes"};
    if (!is_valid_length(
            err_out,
            sig_bytes.ByteLength(),
            BLST_TS_SIGNATURE_LENGTH_COMPRESSED,
            BLST_TS_SIGNATURE_LENGTH_UNCOMPRESSED)) {
        Napi::TypeError::New(env, err_out).ThrowAsJavaScriptException();
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
                // is_affine defaults to false
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
                module->_signature_ctr.New({Napi::External<P2Wrapper>::New(
                    env,
                    new P2Affine{blst::P2_Affine{
                        sig_bytes.Data(), sig_bytes.ByteLength()}})}));
        }
        return scope.Escape(
            module->_signature_ctr.New({Napi::External<P2Wrapper>::New(
                env,
                new P2{blst::P2{sig_bytes.Data(), sig_bytes.ByteLength()}})}));
    } catch (blst::BLST_ERROR err) {
        Napi::RangeError::New(env, module->GetBlstErrorString(err))
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
}

Signature::Signature(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Signature>{info}, _point{nullptr} {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    // Check that constructor was called from C++ and not JS. Externals can only
    // be created natively.
    if (!info[0].IsExternal()) {
        Napi::Error::New(env, "Signature constructor is private")
            .ThrowAsJavaScriptException();
        return;
    }
    _point.reset(info[0].As<Napi::External<P2Wrapper>>().Data());
}

Napi::Value Signature::Serialize(const Napi::CallbackInfo &info){
    BLST_TS_SERIALIZE_POINT(SIGNATURE)}

Napi::Value Signature::SigValidate(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (!_point->InGroup()) {
        Napi::Error::New(env, "BLST_ERROR::BLST_POINT_NOT_IN_GROUP")
            .ThrowAsJavaScriptException();
    }
    return env.Undefined();
}

Napi::Value Signature::IsInfinity(const Napi::CallbackInfo &info) {
    BLST_TS_IS_INFINITY
}
