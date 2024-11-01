/// <reference types="vite/client" />

import type { PixiReactElementProps } from "@pixi/react";
import type { Layout } from "@pixi/layout";
import type { Viewport } from "pixi-viewport";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      layout: PixiReactElementProps<typeof Layout>;
      viewport: PixiReactElementProps<typeof Viewport>;
    }
  }
}
