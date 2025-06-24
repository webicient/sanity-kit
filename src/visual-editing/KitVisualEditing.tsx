"use client";

import { VisualEditing } from "next-sanity";
import { draftMode } from "next/headers";
import { DisablePreviewMode } from "./DisablePreviewMode";
import { Fragment } from "react";

export function KitVisualEditing() {
  if (!draftMode().isEnabled) {
    return null;
  }

  return (
    <Fragment>
      <DisablePreviewMode />
      <VisualEditing />
    </Fragment>
  );
}
