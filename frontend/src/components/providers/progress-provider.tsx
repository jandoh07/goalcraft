"use client";

import { ProgressProvider } from "@bprogress/next/app";

export function AppProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressProvider
      height="4px"
      color="#6077de"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
