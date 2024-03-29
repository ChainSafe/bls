"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.getBindingsPath = exports.getBinaryName = exports.BINDINGS_FILE = exports.BINDINGS_NAME = void 0;
var node_path_1 = require("path");
var node_fs_1 = require("fs");
var node_child_process_1 = require("child_process");
exports.BINDINGS_NAME = "blst_ts_addon";
exports.BINDINGS_FILE = "".concat(exports.BINDINGS_NAME, ".node");
var NotNodeJsError = /** @class */ (function (_super) {
    __extends(NotNodeJsError, _super);
    function NotNodeJsError(missingItem) {
        return _super.call(this, "blst-ts bindings only run in a NodeJS context. No ".concat(missingItem, " found.")) || this;
    }
    return NotNodeJsError;
}(Error));
/**
 * Get binary name.
 * name: {platform}-{arch}-{v8 version}-blst_ts_addon.node
 */
function getBinaryName() {
    if (!process)
        throw new NotNodeJsError("global object");
    var platform = process.platform;
    if (!platform)
        throw new NotNodeJsError("process.platform");
    var arch = process.arch;
    if (!arch)
        throw new NotNodeJsError("process.arch");
    var nodeApiVersion = process.versions.modules;
    if (!nodeApiVersion)
        throw new NotNodeJsError("process.versions.modules");
    return [platform, arch, nodeApiVersion, exports.BINDINGS_FILE].join("-");
}
exports.getBinaryName = getBinaryName;
/**
 * Builds a list of search paths to look for the bindings file
 */
function buildSearchPaths(rootDir, filename) {
    var searchLocations = [
        [rootDir],
        [rootDir, "prebuild"],
        [rootDir, "build"],
        [rootDir, "build", "Debug"],
        [rootDir, "build", "Release"],
    ];
    return searchLocations.map(function (location) { return node_path_1.resolve.apply(void 0, __spreadArray(__spreadArray([], __read(location), false), [filename], false)); });
}
/**
 * Locates the bindings file using the blst-ts naming convention for prebuilt
 * bindings. Falls back to node-gyp naming if not found.
 */
function getBindingsPath(rootDir) {
    var e_1, _a;
    var names = [getBinaryName(), exports.BINDINGS_FILE];
    var searchLocations = names.map(function (name) { return buildSearchPaths(rootDir, name); }).flat();
    try {
        for (var searchLocations_1 = __values(searchLocations), searchLocations_1_1 = searchLocations_1.next(); !searchLocations_1_1.done; searchLocations_1_1 = searchLocations_1.next()) {
            var filepath = searchLocations_1_1.value;
            if ((0, node_fs_1.existsSync)(filepath)) {
                return filepath;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (searchLocations_1_1 && !searchLocations_1_1.done && (_a = searchLocations_1.return)) _a.call(searchLocations_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    throw Error("Could not find bindings file. Tried:\n".concat(searchLocations.join("\n")));
}
exports.getBindingsPath = getBindingsPath;
var defaultOptions = {
    timeout: 3 * 60 * 1000, // ms
    maxBuffer: 10e6, // bytes
    pipeInput: false,
};
function exec(command, logToConsole, execOptions) {
    if (logToConsole === void 0) { logToConsole = true; }
    if (execOptions === void 0) { execOptions = {}; }
    var options = __assign(__assign({}, defaultOptions), execOptions);
    var child;
    var promise = new Promise(function (resolve, reject) {
        var _a, _b;
        var chunks = [];
        function bufferOutput(data) {
            chunks.push(Buffer.from(data));
        }
        function stdoutHandler(data) {
            process.stdout.write(data);
        }
        function stderrHandler(data) {
            process.stderr.write(data);
        }
        child = (0, node_child_process_1.exec)(command, options, function (err) {
            var _a, _b;
            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.removeAllListeners("data");
            (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.removeAllListeners("data");
            var output = Buffer.concat(chunks).toString("utf8");
            if (err) {
                return reject(err);
            }
            return resolve(output);
        });
        if (child.stdin && options.pipeInput) {
            process.stdin.pipe(child.stdin);
        }
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on("data", logToConsole ? stdoutHandler : bufferOutput);
        (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on("data", logToConsole ? stderrHandler : bufferOutput);
        child.on("exit", function () {
            return resolve(Buffer.concat(chunks).toString("utf8"));
        });
    });
    promise.child = child;
    return promise;
}
exports.exec = exec;
//# sourceMappingURL=index.js.map