#pragma once

#include "addon.h"

namespace blst_ts {
static const size_t signature_length_compressed = 96;
static const size_t signature_length_uncompressed = 192;

typedef struct {
    std::unique_ptr<blst::P2_Affine> smart_pointer;
    blst::P2_Affine *raw_point;
} P2AffineGroup;

class P2Wrapper {
   public:
    virtual ~P2Wrapper() = default;
    virtual bool IsInfinite() const = 0;
    virtual bool InGroup() const = 0;
    virtual void AddTo(blst::P2 &point) const = 0;
    virtual void Serialize(bool compress, blst::byte *out) const = 0;
    virtual P2AffineGroup AsAffine() = 0;
    virtual blst::P2 MultiplyBy(
        const blst::byte *rand_bytes, const size_t rand_bytes_length) const = 0;
    virtual void Sign(
        const blst::SecretKey &key,
        const uint8_t *msg,
        const size_t msg_length,
        const std::string &dst) = 0;
};

class P2 final : public P2Wrapper {
   private:
    blst::P2 _point;

   public:
    P2(blst::P2 point) : _point(std::move(point)) {}
    bool IsInfinite() const final { return _point.is_inf(); }
    bool InGroup() const final { return _point.in_group(); }
    void AddTo(blst::P2 &point) const final { point.add(_point); };
    void Serialize(bool compress, blst::byte *out) const final;
    P2AffineGroup AsAffine() final;
    blst::P2 MultiplyBy(
        const blst::byte *rand_bytes,
        const size_t rand_bytes_length) const final;
    void Sign(
        const blst::SecretKey &key,
        const uint8_t *msg,
        const size_t msg_length,
        const std::string &dst) final;
};

class P2Affine final : public P2Wrapper {
   private:
    blst::P2_Affine _point;

   public:
    P2Affine(blst::P2_Affine point) : _point(std::move(point)) {}
    bool IsInfinite() const final { return _point.is_inf(); }
    bool InGroup() const final { return _point.in_group(); }
    void AddTo(blst::P2 &point) const final { point.add(_point); };
    void Serialize(bool compress, blst::byte *out) const final;
    P2AffineGroup AsAffine() final;
    blst::P2 MultiplyBy(
        const blst::byte *rand_bytes,
        const size_t rand_bytes_length) const final;
    void Sign(
        const blst::SecretKey &key,
        const uint8_t *msg,
        const size_t msg_length,
        const std::string &dst) final;
};

class Signature final : public Napi::ObjectWrap<Signature> {
   public:
    std::unique_ptr<P2Wrapper> point;

    static void Init(Napi::Env env, Napi::Object &exports, BlstTsAddon *module);
    static Napi::Value Deserialize(const Napi::CallbackInfo &info);
    Signature(const Napi::CallbackInfo &info);
    Napi::Value Serialize(const Napi::CallbackInfo &info);
    Napi::Value SigValidate(const Napi::CallbackInfo &info);
    Napi::Value IsInfinity(const Napi::CallbackInfo &info);
    Napi::Value MultiplyBy(const Napi::CallbackInfo &info);
};
}  // namespace blst_ts
