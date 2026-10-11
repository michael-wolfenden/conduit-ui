import { HttpResponse } from "msw";
import * as z from "zod";

import { dbUsers } from "#app/__msw__/db.ts";

function getAuthorizationToken(request: Request) {
  const authorizationHeader = request.headers.get("Authorization");

  if (authorizationHeader === null) return;
  if (!authorizationHeader.startsWith("Token ")) return;

  return authorizationHeader.split(" ")[1];
}

export function getAuthenticatedUser(request: Request) {
  const token = getAuthorizationToken(request);
  if (token === undefined) {
    return undefined;
  }

  try {
    // token is { sub: userId } base64 encoded
    const userId = z.object({ sub: z.number() }).parse(JSON.parse(atob(token))).sub;
    return dbUsers.find((u) => u.id === userId);
  } catch {
    return undefined;
  }
}

export function getAuthenticatedUserOrThrow(request: Request) {
  const user = getAuthenticatedUser(request);
  if (user === undefined) throw unauthorized();

  return user;
}

function error(statusCode: number, errors?: Record<string, string[]>) {
  if (errors) return HttpResponse.json({ errors }, { status: statusCode });

  return HttpResponse.json(null, { status: statusCode });
}

export function notFound() {
  return error(404);
}

export function forbidden() {
  return error(403);
}

export function unprocessableContent(errors: Record<string, string[]>) {
  return error(422, errors);
}

export function unauthorized(errors?: Record<string, string[]>) {
  return error(401, errors);
}

export function conflict(errors: Record<string, string[]>) {
  return error(409, errors);
}

export { http } from "#app/__msw__/msw.http.ts";
export { HttpResponse } from "msw";
