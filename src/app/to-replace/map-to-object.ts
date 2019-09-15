import { keyBy, map, mapValues } from "micro-dash";

export function mapToObject(collection: any, iteratee: any) {
  const pairs = map(collection, iteratee);
  return mapValues(
    keyBy<any, any>(pairs, ([key]) => key),
    ([_, value]) => value,
  );
}
