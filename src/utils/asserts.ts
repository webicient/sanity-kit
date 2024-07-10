/**
 * Asserts that a value is not undefined.
 *
 * @param v The value to assert.
 * @param errorMessage The error message to throw if the value is undefined.
 * @returns The value if it is not undefined.
 */
export function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
