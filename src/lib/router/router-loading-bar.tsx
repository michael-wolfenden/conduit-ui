import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { LoadingBarRef } from "react-top-loading-bar";
import LoadingBar from "react-top-loading-bar";
import { useSpinDelay } from "spin-delay";

export function RouterLoadingBar() {
  const loadingBarRef = useRef<LoadingBarRef>(null);
  const startedRef = useRef(false);
  const isRouterPending = useRouterState({ select: ({ status }) => status === "pending" });
  const isPending = useSpinDelay(isRouterPending, { ssr: false, delay: 250, minDuration: 200 });

  useEffect(() => {
    if (loadingBarRef.current === null) return;

    if (isPending && !startedRef.current) {
      startedRef.current = true;
      loadingBarRef.current.continuousStart();
    } else if (startedRef.current) {
      startedRef.current = false;
      loadingBarRef.current.complete();
    }
  }, [isPending]);

  return <LoadingBar color="#5cb85c" ref={loadingBarRef} shadow />;
}
