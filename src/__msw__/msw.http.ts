import type {
  InferKey,
  InferParamPath,
  FetchSchema,
  StandardSchemaV1,
  Schema as BetterFetchSchema,
} from "@better-fetch/fetch";
import { http as mswHttp } from "msw";
import type { HttpResponseResolver, RequestHandlerOptions, HttpHandler } from "msw";

import type { apiSchema } from "#app/api/api.instance.ts";
import { env } from "#app/lib/utils/env.ts";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type InferStandardSchema<T> = T extends StandardSchemaV1
  ? Prettify<StandardSchemaV1.InferOutput<T>>
  : never;

type GetFetchSchemaForPath<
  Schema extends BetterFetchSchema,
  Path extends InferKey<Schema>,
  Params = Schema["schema"][Path],
> = Params extends FetchSchema ? Params : never;

type GetParamsForPath<
  Schema extends BetterFetchSchema,
  Path extends InferKey<Schema>,
  ParamPath = InferParamPath<Path>,
> = ParamPath extends Record<string, never> ? never : ParamPath;

type GetRequestBodyTypeForPath<
  Schema extends BetterFetchSchema,
  Path extends InferKey<Schema>,
> = InferStandardSchema<GetFetchSchemaForPath<Schema, Path>["input"]>;

type GetResponseBodyTypeForPath<
  Schema extends BetterFetchSchema,
  Path extends InferKey<Schema>,
> = InferStandardSchema<GetFetchSchemaForPath<Schema, Path>["output"]>;

type MSWRequestHandlers<Schema extends BetterFetchSchema> = <Path extends InferKey<Schema>>(
  path: Path,
  resolver: HttpResponseResolver<
    GetParamsForPath<Schema, Path>,
    GetRequestBodyTypeForPath<Schema, Path>,
    GetResponseBodyTypeForPath<Schema, Path>
  >,
  options?: RequestHandlerOptions,
) => HttpHandler;

function createMSWRequestHandlers<Schema extends BetterFetchSchema>(
  baseUrl: string,
): MSWRequestHandlers<Schema> {
  return (path, resolver, options) => {
    // strip @{method} from front ie @get/tags => /tags
    const match = /^@(\w+)\/(.*)$/.exec(path);
    if (!match) throw new Error(`Invalid mock path "${path}": expected format "@method/path"`);
    const [, method, rest] = match; // const [, 'get', 'tags']
    const httpMethod = method as keyof typeof mswHttp;

    return mswHttp[httpMethod](`${baseUrl}/${rest}`, resolver, options);
  };
}

const http = createMSWRequestHandlers<typeof apiSchema>(env.API_BASE_URL);

export { http };
