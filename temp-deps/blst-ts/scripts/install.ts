/* eslint-disable no-console */
import {resolve} from "path";
import {Readable} from "stream";
import {finished} from "stream/promises";
import {ReadableStream} from "stream/web";
import {execSync} from "child_process";
import {copyFileSync, createWriteStream, existsSync, mkdirSync} from "fs";
import {exec, getBinaryName, getBindingsPath} from "../utils";

const ROOT_DIR = resolve(__dirname, "..");
const PREBUILD_DIR = resolve(ROOT_DIR, "prebuild");

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const VERSION: string = require(resolve(ROOT_DIR, "package.json")).version;

/**
 * Loading prebuilt bindings may fail in any number of unhappy ways, including a
 * segfault. We use child processes to catch these unrecoverable process-level
 * errors and continue the installation process
 */
async function testBindings(binaryPath: string): Promise<void> {
  execSync(`node -e 'require("${binaryPath}")'`);
}

function getPrebuiltBinaryPath(binaryName: string): string {
  return resolve(PREBUILD_DIR, binaryName);
}

function getReleaseUrl(binaryName: string): string {
  return `https://github.com/ChainSafe/blst-ts/releases/download/v${VERSION}/${binaryName}`;
}

/**
 * Download bindings from GitHub release
 */
async function downloadBindings(binaryName: string): Promise<string> {
  const {body, status} = await fetch(getReleaseUrl(binaryName));

  if (!body || status >= 400) {
    throw new Error("Failed to download bindings");
  }

  if (!existsSync(PREBUILD_DIR)) {
    mkdirSync(PREBUILD_DIR, {recursive: true});
  }

  const outputPath = getPrebuiltBinaryPath(binaryName);

  await finished(Readable.fromWeb(body as ReadableStream<Uint8Array>).pipe(createWriteStream(outputPath)));

  return outputPath;
}

async function buildBindings(binaryName: string): Promise<string> {
  await exec("npm run clean:gyp", true, {cwd: ROOT_DIR});
  await exec("npm run build:gyp", true, {cwd: ROOT_DIR});
  const bindingPath = getBindingsPath(ROOT_DIR);

  if (!existsSync(PREBUILD_DIR)) {
    mkdirSync(PREBUILD_DIR, {recursive: true});
  }

  const outputPath = getPrebuiltBinaryPath(binaryName);
  copyFileSync(bindingPath, outputPath);
  return outputPath;
}

async function install(): Promise<void> {
  const binaryName = getBinaryName();

  // Check if bindings already bundled, downloaded or built
  let binaryPath: string | undefined = getPrebuiltBinaryPath(binaryName);
  if (existsSync(binaryPath)) {
    console.log(`Found prebuilt bindings at ${binaryPath}`);
    try {
      await testBindings(binaryPath);
      return;
    } catch {
      console.log("Prebuilt and bundled bindings failed to load. Attempting to download.");
    }
  }

  // Fetch pre-built bindings from remote repo
  try {
    binaryPath = await downloadBindings(binaryName);
  } catch {
    /* no-op */
  }

  if (existsSync(binaryPath)) {
    console.log(`Downloaded github release bindings to ${binaryPath}`);
    try {
      await testBindings(binaryPath);
      return;
    } catch {
      console.log("Downloaded bindings failed to load. Attempting to build.");
    }
  }

  // Build bindings locally from source
  binaryPath = await buildBindings(binaryPath);
  if (!existsSync(binaryPath)) {
    throw new Error("Error building blst-ts binary. No fallback available");
  }

  try {
    await testBindings(binaryPath);
    console.log(`Successfully built bindings to ${binaryPath}`);
  } catch {
    throw new Error("Locally built bindings failed to load. No fallback available");
  }
}

// CLI runner
install().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
