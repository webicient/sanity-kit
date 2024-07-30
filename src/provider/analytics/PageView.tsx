"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { saveUserIdToLocalStorage } from "./trackers";
import { sendGTMEvent } from "@next/third-parties/google";

export default function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Generate a user ID for the current session.
    saveUserIdToLocalStorage();

    // Send page view event.
    if (pathname) {
      sendGTMEvent({
        event: "page_view",
        page: pathname + searchParams.toString(),
      });
    }
  }, [pathname, searchParams]);

  return null;
}
