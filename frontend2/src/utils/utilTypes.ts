export type Maybe<T> = T | undefined;

/**
 * Helper function to remove nothing types from a type.
 * @param val Item to check if is present.
 * @returns Whether val is not null or undefined.
 */
export function isPresent<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}
