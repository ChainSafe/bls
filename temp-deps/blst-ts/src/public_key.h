#ifndef BLST_TS_PUBLIC_KEY_H__
#define BLST_TS_PUBLIC_KEY_H__

#include <memory>

#include "addon.h"
#include "blst.hpp"
#include "napi.h"

#define BLST_TS_PUBLIC_KEY_LENGTH_COMPRESSED 48U
#define BLST_TS_PUBLIC_KEY_LENGTH_UNCOMPRESSED 96U

typedef struct {
    std::unique_ptr<blst::P1_Affine> smart_pointer;
    blst::P1_Affine *raw_point;
} P1AffineGroup;

class P1Wrapper {
   public:
    virtual ~P1Wrapper() = default;
    virtual bool IsInfinite() = 0;
    virtual bool InGroup() = 0;
    virtual void Serialize(bool compress, blst::byte *out) = 0;
    virtual void AddTo(blst::P1 &point) = 0;
    virtual P1AffineGroup AsAffine() = 0;
};

class P1 : public P1Wrapper {
    blst::P1 _point;

   public:
    P1(blst::P1 point) : _point(std::move(point)) {}
    bool IsInfinite() override { return _point.is_inf(); }
    bool InGroup() override { return _point.in_group(); }
    void Serialize(bool compress, blst::byte *out) override {
        compress ? _point.compress(out) : _point.serialize(out);
    }
    void AddTo(blst::P1 &point) override { point.add(_point); };
    P1AffineGroup AsAffine() override {
        P1AffineGroup group{std::make_unique<blst::P1_Affine>(_point), nullptr};
        group.raw_point = group.smart_pointer.get();
        return group;
    };
};

class P1Affine : public P1Wrapper {
    blst::P1_Affine _point;

   public:
    P1Affine(blst::P1_Affine point) : _point(std::move(point)) {}
    bool IsInfinite() override { return _point.is_inf(); }
    bool InGroup() override { return _point.in_group(); }
    void Serialize(bool compress, blst::byte *out) override {
        compress ? _point.compress(out) : _point.serialize(out);
    }
    void AddTo(blst::P1 &point) override { point.add(_point); };
    P1AffineGroup AsAffine() override {
        P1AffineGroup group{.raw_point = &_point};
        return group;
    }
};

class PublicKey : public Napi::ObjectWrap<PublicKey> {
   public:
    std::unique_ptr<P1Wrapper> _point;

    static void Init(Napi::Env env, Napi::Object &exports, BlstTsAddon *module);
    static Napi::Value Deserialize(const Napi::CallbackInfo &info);
    PublicKey(const Napi::CallbackInfo &info);
    Napi::Value Serialize(const Napi::CallbackInfo &info);
    Napi::Value KeyValidate(const Napi::CallbackInfo &info);
    Napi::Value IsInfinity(const Napi::CallbackInfo &info);
};

#endif /* BLST_TS_PUBLIC_KEY_H__ */
