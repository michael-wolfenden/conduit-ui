import { BetterFetchError } from "@better-fetch/fetch";
import * as z from "zod";

const serverErrorsSchema = z.object({
  errors: z.record(z.string(), z.array(z.string().trim())),
});

function isBetterFetchError(error: Error): error is BetterFetchError {
  return error instanceof BetterFetchError;
}

function isStatusCodeError(error: Error, statusCode: number) {
  return isBetterFetchError(error) && error.status === statusCode;
}

// export function isValidationError(error: Error) {
//   // api returns 422's but e2e test throw 400's so handle both
//   return isStatusCodeError(error, 400) || isStatusCodeError(error, 422);
// }

// export function isUnauthorizedError(error: Error) {
//   return isStatusCodeError(error, 401);
// }

// export function isConflictError(error: Error) {
//   return isStatusCodeError(error, 409);
// }

export function isInternalServerError(error: Error) {
  return isStatusCodeError(error, 500);
}

export function getServerErrors(error: Error): string[] {
  if (!isBetterFetchError(error)) return [error.message];

  const parsedResponse = serverErrorsSchema.safeParse(error.error);
  if (!parsedResponse.success) return [error.message];

  /**
   * Map from service side response:
   * "errors": {
   *   "email": ["can't be blank"],
   *   "password": ["can't be blank"]
   * }
   * to:
   * ["email can't be blank", "password can't be blank"]
   */

  const { errors } = parsedResponse.data;
  return Object.keys(errors).map((key) => `${key} ${errors[key].join(",")}`);
}
