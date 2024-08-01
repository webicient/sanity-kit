import Image, { ImageProps } from "next/image";
import { urlForImage, urlForImageWithDimensions } from "../utils/image";
import { ImagePayload } from "../types/object";
import { getImageDimensions } from "@sanity/asset-utils";

type ImageResolverProps = Omit<ImageProps, "src" | "alt"> & {
  image?: ImagePayload;
  alt?: string;
  width: number;
  height: number;
};

export function ImageResolver({ image, width, height, alt, ...props }: ImageResolverProps) {
  if (!image) {
    return null;
  }

  const passProps: ImageProps = {
    src: urlForImage(image) || "",
    alt: alt || image?.asset?.altText || image?.asset?.title || "",
  };

  // If the image has no source, return null.
  if (!passProps.src) {
    return null;
  }

  const croppedImage = urlForImageWithDimensions(image, width, height);
  // Use the image with the specified dimensions for better performance.
  if (croppedImage) {
    passProps.src = croppedImage;
    passProps.width = width;
    passProps.height = height;
  } else {
    const dimensions = getImageDimensions(passProps.src as string);
    passProps.width = dimensions?.width || width;
    passProps.height = dimensions?.height || height;
  }

  // Force resizing of the image if the fill prop is set.
  if (props.fill) {
    delete passProps.width;
    delete passProps.height;
  }

  return (
    <Image {...passProps} {...props} />
  );
}
