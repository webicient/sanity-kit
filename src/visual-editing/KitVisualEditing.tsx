import { VisualEditing } from "next-sanity";
import { draftMode } from "next/headers";
import { CSSProperties } from "react";

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

export function KitVisualEditing() {
  if (!draftMode().isEnabled) {
    return null;
  }

  return (
    <div id="kit-visual-editing">
      <a style={STYLE} href="/api/draft/disable">
        Disable preview mode
      </a>
      <VisualEditing />
    </div>
  );
}
