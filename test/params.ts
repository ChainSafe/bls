import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SPEC_TEST_VERSION = "v1.3.0";
export const SPEC_TEST_TO_DOWNLOAD = ["general" as const];
export const SPEC_TESTS_DIR = path.join(__dirname, "spec-tests");
