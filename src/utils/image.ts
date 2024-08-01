import createImageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../env/env";
import { ImagePayload } from "../types/object";

/**
 * Creates an image URL builder with the specified project ID and dataset.
 *
 * @param projectId The project ID.
 * @param dataset The dataset.
 * @returns An image URL builder.
 */
export const imageBuilder = createImageUrlBuilder({
  projectId: projectId,
  dataset: dataset,
});

/**
 * Returns the URL for the given image.
 *
 * @param image - The image object.
 * @returns The URL of the image.
 */
export function urlForImage(image: ImagePayload | undefined) {
  return image && imageBuilder?.image(image).auto("format").fit("max").url();
}

/**
 * Returns the URL for the given image.
 *
 * @param image - The image object.
 * @returns The URL of the image.
 */
export function urlForImageWithDimensions(
  image: ImagePayload | undefined,
  width: number,
  height: number,
) {
  return image && imageBuilder?.image(image).width(width).height(height).url();
}

/**
 * Generates the URL for the Open Graph image.
 *
 * @param image - The image object.
 * @returns The URL for the Open Graph image.
 */
export function urlForOpenGraphImage(image: ImagePayload | undefined) {
  return (
    image &&
    imageBuilder?.image(image).width(1200).height(630).fit("crop").url()
  );
}
