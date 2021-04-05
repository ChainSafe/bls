export function chunkify<T>(arr: T[], chunkCount: number): T[][] {
  const chunkSize = Math.round(arr.length / chunkCount);
  const arrArr: T[][] = [];

  for (let i = 0, j = arr.length; i < j; i += chunkSize) {
    arrArr.push(arr.slice(i, i + chunkSize));
  }

  return arrArr;
}
