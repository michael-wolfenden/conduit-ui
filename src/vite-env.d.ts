/*
The template uses a custom element (app-layout-footer) for styling.
Since this isn't a standard html tag we need to tell typescript about it

<app-layout-footer>
  <footer>
    ...
  </footer>
</app-layout-footer>
*/

import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "app-layout-footer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
