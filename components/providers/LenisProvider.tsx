"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import type { ComponentType, ReactNode } from "react";

const Lenis = ReactLenis as unknown as ComponentType<{
  root?: boolean;
  options?: {
    lerp?: number;
    duration?: number;
    smoothWheel?: boolean;
  };
  children?: ReactNode;
}>;

export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <Lenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </Lenis>
  );
}
