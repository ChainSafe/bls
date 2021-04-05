type PromiseOptional<T> = T | Promise<T>;

export async function runBenchmark<T, R>({
  prepareTest,
  testRunner,
  runs = 100,
  id,
}: {
  prepareTest: (i: number) => PromiseOptional<T>;
  testRunner: (input: T) => PromiseOptional<R>;
  runs?: number;
  id: string;
}): Promise<void> {
  const diffsNanoSec: bigint[] = [];

  for (let i = 0; i < runs; i++) {
    const input = await prepareTest(i);

    const start = process.hrtime.bigint();
    const result = await testRunner(input);
    const end = process.hrtime.bigint();

    diffsNanoSec.push(end - start);
  }

  const average = averageBigint(diffsNanoSec);
  const opsPerSec = 1e9 / Number(average);
  // eslint-disable-next-line no-console
  console.log(`${id}: ${opsPerSec.toPrecision(5)} ops/sec (${runs} runs)`); // ±1.74%
}

function averageBigint(arr: bigint[]): bigint {
  const total = arr.reduce((total, value) => total + value);
  return total / BigInt(arr.length);
}
