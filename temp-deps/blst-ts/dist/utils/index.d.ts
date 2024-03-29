/// <reference types="node" />
import { ExecOptions, PromiseWithChild } from "child_process";
export declare const BINDINGS_NAME = "blst_ts_addon";
export declare const BINDINGS_FILE = "blst_ts_addon.node";
/**
 * Get binary name.
 * name: {platform}-{arch}-{v8 version}-blst_ts_addon.node
 */
export declare function getBinaryName(): string;
/**
 * Locates the bindings file using the blst-ts naming convention for prebuilt
 * bindings. Falls back to node-gyp naming if not found.
 */
export declare function getBindingsPath(rootDir: string): string;
export interface ExecPromiseOptions extends ExecOptions {
    pipeInput?: boolean;
}
export declare function exec(command: string, logToConsole?: boolean, execOptions?: ExecPromiseOptions): PromiseWithChild<string>;
//# sourceMappingURL=index.d.ts.map