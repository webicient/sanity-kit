import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest): Response {
  if (!process.env.SANITY_READ_TOKEN) {
    return new Response("Missing environment variable SANITY_READ_TOKEN", {
      status: 500,
    });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "/";

  draftMode().enable();
  return NextResponse.redirect(new URL(slug, request.url));
}
