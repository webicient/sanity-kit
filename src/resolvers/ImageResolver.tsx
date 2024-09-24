import Image, { ImageProps } from "next/image";
import { urlForImage, urlForImageWithDimensions } from "../utils/image";
import { ImagePayload } from "../types/object";

type ImageResolverProps = Omit<ImageProps, "src" | "alt"> & {
  image?: ImagePayload;
  alt?: string;
  width: number;
  height: number;
};

const IMAGE_QUALITY = 85;

export function ImageResolver({
  image,
  width,
  height,
  alt,
  ...props
}: ImageResolverProps) {
  if (!image) {
    return null;
  }

  const passProps: ImageProps = {
    src: urlForImage(image) || "",
    alt: alt || image?.asset?.altText || image?.asset?.title || "",
    width: width,
    height: height,
    quality: IMAGE_QUALITY,
  };

  // If the image has no source, return null.
  if (!passProps.src) {
    return null;
  }

  // Force resizing of the image if the fill prop is set.
  if (props.fill) {
    delete passProps.width;
    delete passProps.height;

    // Use the image with the specified dimensions for better performance.
    // Can adjust the multiplier to get a better quality image.
    const croppedImage = urlForImageWithDimensions(image, width * 2, height * 2);
    if (croppedImage) {
      passProps.src = croppedImage;
    }
  }

  return <Image {...passProps} {...props} />;
}
