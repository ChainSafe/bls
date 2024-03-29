export var CoordType;
(function (CoordType) {
    CoordType[CoordType["affine"] = 0] = "affine";
    CoordType[CoordType["jacobian"] = 1] = "jacobian";
})(CoordType || (CoordType = {}));
export var PointFormat;
(function (PointFormat) {
    PointFormat["compressed"] = "compressed";
    PointFormat["uncompressed"] = "uncompressed";
})(PointFormat || (PointFormat = {}));
