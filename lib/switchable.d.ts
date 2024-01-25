import type { IBls, Implementation } from "./types.js";
declare const bls: IBls;
export default bls;
export declare function init(impl: Implementation): Promise<void>;
