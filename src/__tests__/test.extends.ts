import type { SetupWorker } from "msw/browser";
import { HttpNetworkFrame } from "msw/experimental";
import { test as testBase } from "vitest";
import type { TestAPI } from "vitest";

import { worker } from "#app/__msw__/msw.worker.ts";
import { env } from "#app/lib/utils/env.ts";

// Public shape of the fixture context — what consumers of `test` actually see
// and are allowed to use in their test bodies.
interface TestContext {
  worker: SetupWorker;
}

// Internal-only shape that adds the `_workerInitialize` fixture. This fixture
// exists purely to control setup/teardown ordering and isn't meant to be
// consumed directly by tests, so it's kept out of the public `TestContext`.
type InternalContext = TestContext & {
  _workerInitialize: void;
};

export const test: TestAPI<TestContext> = testBase.extend<InternalContext>({
  // Starts the MSW worker exactly once per Vitest worker process (not once
  // per test file or per test). `scope: "worker"` + `auto: true` ensures this
  // runs automatically before any test in the worker process, without every
  // test needing to explicitly depend on it.
  _workerInitialize: [
    // oxlint-disable-next-line no-empty-pattern -- without this vitest errors with 'The 1st argument inside a fixture must use object destructuring pattern;
    async ({}, use) => {
      await worker.start({
        quiet: true,
        onUnhandledFrame({ frame, defaults }) {
          // only error for unhandled requests to our own API
          if (
            frame instanceof HttpNetworkFrame &&
            frame.data.request.url.startsWith(env.API_BASE_URL)
          ) {
            defaults.error();
          }
        },
      });

      // Hand control back to the test run. Everything after `use()` resolves
      // runs during teardown, once the worker process is shutting down.
      await use();

      // Stop the worker when the entire test worker shuts down.
      await worker.stop();
    },
    { scope: "worker", auto: true },
  ],

  // Exposes the shared MSW `worker` instance to individual tests, and
  // guarantees handler cleanup between tests so mocks registered in one
  // test don't leak into the next.
  // `_workerInitialize` isn't part of the public `TestContext`, but declaring
  // it as a dependency here ensures Vitest initializes the worker before this fixture runs.
  // @ts-expect-error
  worker: async ({ _workerInitialize }, use) => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks
    await use(worker);

    // Runs after each individual test (test-scoped, not worker-scoped):
    // reset any `worker.use(...)` overrides so the next test starts clean.
    worker.resetHandlers();
  },
});
