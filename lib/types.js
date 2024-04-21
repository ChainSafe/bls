export var PointFormat;
(function (PointFormat) {
    PointFormat["compressed"] = "compressed";
    PointFormat["uncompressed"] = "uncompressed";
})(PointFormat || (PointFormat = {}));
/**
 * NOTE: This MUST match the type used in @chainsafe/blst.  Do not use the one
 * exported by that library though or it will mess up tree shaking.  Use the one
 * below instead by MAKE SURE if you change this that it matches the enum values
 * used by the native bindings in the base library!!!!  Better yet do not modify
 * this unless you are ABSOLUTELY SURE you know what you are doing...
 */
/**
 * CoordType allows switching between affine and jacobian version of underlying
 * bls points.
 */
export var CoordType;
(function (CoordType) {
    CoordType[CoordType["affine"] = 0] = "affine";
    CoordType[CoordType["jacobian"] = 1] = "jacobian";
})(CoordType || (CoordType = {}));
