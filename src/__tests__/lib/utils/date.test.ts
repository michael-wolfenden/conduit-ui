import { expect, test } from "vitest";

import { formatIsoDate } from "#app/lib/utils/date.ts";

test("converts ISO date to formatted string with timezone awareness", () => {
  expect(formatIsoDate("2026-08-24T20:00:00.000Z", "Australia/Perth")).toBe("August 25, 2026");
});
