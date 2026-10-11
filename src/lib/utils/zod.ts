import type * as z from "zod";

type NonUndefined<T> = T extends undefined ? never : T;

/**
 * Applies a single fallback value for both missing and invalid input,
 * so you don't have to pass the same value to `.default()` and `.catch()` separately.
 *
 * `fallback(z.number(), 1)` is equivalent to `z.number().default(1).catch(1)`.
 */
export function fallback<TSchema extends z.ZodType>(
  schema: TSchema,
  fallbackValue: NonUndefined<z.output<TSchema>>,
) {
  // oxlint-disable-next-line promise/prefer-await-to-then - catch is a method on schema
  return schema.catch(fallbackValue).default(fallbackValue);
}
