import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { serverClient } from "@webicient/sanity-kit/query";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!process.env.SANITY_READ_TOKEN) {
    return new Response("Missing environment variable SANITY_READ_TOKEN", {
      status: 500,
    });
  }

  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    serverClient,
    request.url,
  );

  if (!isValid) {
    return new Response("Invalid secret", { status: 401 });
  }

  draftMode().enable();
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
