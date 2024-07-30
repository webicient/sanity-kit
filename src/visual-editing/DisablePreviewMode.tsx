"use client";

import { CSSProperties, useLayoutEffect, useState } from "react";

const STYLE: CSSProperties = {
  all: "unset",
  position: "fixed",
  bottom: "12px",
  right: "12px",
  background: "black",
  color: "white",
  padding: "6px 8px",
  fontSize: "12px",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  borderRadius: "4px",
  cursor: "pointer",
};

export function DisablePreviewMode() {
  const [isShown, setIsShown] = useState(false);

  if (typeof window === "undefined") {
    return null;
  }

  useLayoutEffect(() => {
    if (!window.frameElement) {
      setIsShown(true);
    }
  }, []);

  if (!isShown) {
    return null;
  }

  return (
    <a style={STYLE} href="/api/draft/disable">
      Disable preview mode
    </a>
  );
}
