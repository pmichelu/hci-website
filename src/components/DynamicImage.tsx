import NextImage, { type ImageProps } from "next/image"
import type { CSSProperties } from "react"

type DynamicImageProps = Omit<ImageProps, "src"> & { src: string }

export default function DynamicImage({ src, alt, className, ...rest }: DynamicImageProps) {
  if (src.startsWith("/uploads/")) {
    const { fill, width, height, sizes, quality, priority, placeholder, blurDataURL, ...htmlProps } = rest as any
    const style: CSSProperties | undefined = fill
      ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
      : undefined
    return (
      <img
        src={src}
        alt={alt || ""}
        className={className}
        style={style}
        {...(!fill && width ? { width: Number(width), height: Number(height) } : {})}
      />
    )
  }

  return <NextImage src={src} alt={alt || ""} className={className} {...rest} />
}
