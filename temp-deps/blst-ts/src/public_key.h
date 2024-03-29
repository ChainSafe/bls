#pragma once

#include "addon.h"

namespace blst_ts {
static const size_t public_key_length_compressed = 48;
static const size_t public_key_length_uncompressed = 96;

typedef struct {
    std::unique_ptr<blst::P1_Affine> smart_pointer;
    blst::P1_Affine *raw_point;
} P1AffineGroup;

class P1Wrapper {
   public:
    virtual ~P1Wrapper() = default;
    virtual bool IsInfinite() const = 0;
    virtual bool InGroup() const = 0;
    virtual void AddTo(blst::P1 &point) const = 0;
    virtual void Serialize(bool compress, blst::byte *out) const = 0;
    virtual P1AffineGroup AsAffine() = 0;
    virtual blst::P1 MultiplyBy(
        const blst::byte *rand_bytes, const size_t rand_bytes_length) const = 0;
};

class P1 final : public P1Wrapper {
   private:
    blst::P1 _point;

   public:
    P1(blst::P1 point) : _point(std::move(point)) {}
    bool IsInfinite() const final { return _point.is_inf(); }
    bool InGroup() const final { return _point.in_group(); }
    void AddTo(blst::P1 &point) const final { point.add(_point); };
    void Serialize(bool compress, blst::byte *out) const final;
    P1AffineGroup AsAffine() final;
    blst::P1 MultiplyBy(
        const blst::byte *rand_bytes,
        const size_t rand_bytes_length) const final;
};

class P1Affine final : public P1Wrapper {
   private:
    blst::P1_Affine _point;

   public:
    P1Affine(blst::P1_Affine point) : _point(std::move(point)) {}
    bool IsInfinite() const final { return _point.is_inf(); }
    bool InGroup() const final { return _point.in_group(); }
    void AddTo(blst::P1 &point) const final { point.add(_point); }
    void Serialize(bool compress, blst::byte *out) const final;
    P1AffineGroup AsAffine() final;
    blst::P1 MultiplyBy(
        const blst::byte *rand_bytes,
        const size_t rand_bytes_length) const final;
};

class PublicKey final : public Napi::ObjectWrap<PublicKey> {
   public:
    std::unique_ptr<P1Wrapper> point;

    static void Init(Napi::Env env, Napi::Object &exports, BlstTsAddon *module);
    static Napi::Value Deserialize(const Napi::CallbackInfo &info);
    PublicKey(const Napi::CallbackInfo &info);
    Napi::Value Serialize(const Napi::CallbackInfo &info);
    Napi::Value KeyValidate(const Napi::CallbackInfo &info);
    Napi::Value IsInfinity(const Napi::CallbackInfo &info);
    Napi::Value MultiplyBy(const Napi::CallbackInfo &info);
};
}  // namespace blst_ts
