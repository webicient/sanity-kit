function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}

export const apiVersion = process.env.SANITY_API_VERSION || "2023-10-06";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const previewUrl =
  process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:3000";

export const studioUrl = process.env.SANITY_STUDIO_PREVIEW_URL || "/studio";

export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;

export const useCdn = false;
