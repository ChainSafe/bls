import {ExecOptions, exec as EXEC, ChildProcess, PromiseWithChild} from "child_process";

export interface ExecPromiseOptions extends ExecOptions {
  pipeInput?: boolean;
}

const defaultOptions: ExecPromiseOptions = {
  timeout: 3 * 60 * 1000, // ms
  maxBuffer: 10e6, // bytes
  pipeInput: false,
};

export function cmdStringExec(
  command: string,
  logToConsole = true,
  execOptions: ExecPromiseOptions = {}
): PromiseWithChild<string> {
  const options = {...defaultOptions, ...execOptions};

  let child!: ChildProcess;
  const promise = new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    function bufferOutput(data: string): void {
      chunks.push(Buffer.from(data));
    }
    function stdoutHandler(data: string): void {
      process.stdout.write(data);
    }
    function stderrHandler(data: string): void {
      process.stderr.write(data);
    }

    child = EXEC(command, options, (err) => {
      child.stdout?.removeAllListeners("data");
      child.stderr?.removeAllListeners("data");
      const output = Buffer.concat(chunks).toString("utf8");
      if (err) {
        return reject(err);
      }
      return resolve(output);
    });

    if (child.stdin && options.pipeInput) {
      process.stdin.pipe(child.stdin);
    }
    child.stdout?.on("data", logToConsole ? stdoutHandler : bufferOutput);
    child.stderr?.on("data", logToConsole ? stderrHandler : bufferOutput);

    child.on("exit", () => {
      return resolve(Buffer.concat(chunks).toString("utf8"));
    });
  }) as PromiseWithChild<string>;

  promise.child = child;
  return promise;
}
