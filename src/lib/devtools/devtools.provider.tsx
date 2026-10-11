import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

const plugins = [
  {
    name: "TanStack Query",
    render: <ReactQueryDevtoolsPanel />,
  },
  {
    name: "TanStack Router",
    render: <TanStackRouterDevtoolsPanel />,
  },
  formDevtoolsPlugin(),
];

export function DevtoolsProvider(): ReactNode {
  return (
    <TanStackDevtools
      plugins={plugins}
      config={{
        triggerMode: "fixed",
      }}
    />
  );
}
