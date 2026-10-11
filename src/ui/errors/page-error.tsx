import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

export function PageError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <div className="container page">
      <h3>Something went wrong.</h3>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="error-messages">{error.stack}</pre>
      )}
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => void router.invalidate()}
      >
        Retry
      </button>
    </div>
  );
}
