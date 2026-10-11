import * as z from "zod";

const envSchema = z
  .object({
    API_BASE_URL: z.url(),
    ENABLE_MOCKS: z.stringbool().default(false),
  })
  .readonly();

// During tests, window.env won't be defined as it's set in the index.html
// which doesn't get rendered during testing, so instead fallback to
// import.meta.env but we need to remove the VITE_ prefix first
const envVariables =
  (globalThis as Record<string, unknown>).env ??
  Object.fromEntries(
    Object.entries(import.meta.env)
      .filter(([key]) => key.startsWith("VITE_"))
      .map(([key, value]) => [key.replace("VITE_", ""), value]),
  );

const parsedEnv = envSchema.safeParse(envVariables);

if (!parsedEnv.success) {
  const fieldErrors = z.prettifyError(parsedEnv.error);
  throw new Error(`Invalid environment variables\n${fieldErrors}`);
}

export const env = parsedEnv.data;
