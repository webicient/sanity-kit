"use client";

import { ErrorBoundary } from "react-error-boundary";

function Fallback({
  error,
  resetErrorBoundary,
  moduleName,
  ...props
}: any): JSX.Element | null {
  if (props) {
    console.error("ModuleErrorBoundary", moduleName, error);
  }

  return null;
}

export function ModuleErrorBoundary({
  children,
  moduleName,
  ...props
}: any): JSX.Element {
  return (
    <ErrorBoundary
      {...props}
      FallbackComponent={(fbProps) => (
        <Fallback moduleName={moduleName} {...fbProps} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
