import Image from "next/image";
import { PhotoDTO } from "@/lib/db/queries";
import cloudflareLoader from "@/lib/storage/loader";

export interface PhotoProps {
  photo: PhotoDTO;
  sizes: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain";
  onClick?: () => void;
}

export function Photo({
  photo,
  sizes,
  priority = false,
  className = "",
  fit = "cover",
  onClick,
}: PhotoProps) {
  if (!photo.alt) {
    console.warn(`[a11y warning] Photo ${photo.id} rendered without alt text.`);
  }

  const focalX = (photo.focal?.x ?? 0.5) * 100;
  const focalY = (photo.focal?.y ?? 0.35) * 100;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{
        aspectRatio: `${photo.width} / ${photo.height}`,
      }}
    >
      <Image
        loader={cloudflareLoader}
        src={photo.displayKey}
        alt={photo.alt || "Photograph by Zetona_E"}
        fill
        sizes={sizes}
        priority={priority}
        className={`w-full h-full object-${fit} transition-opacity duration-300`}
        style={{
          objectPosition: `${focalX}% ${focalY}%`,
        }}
      />
    </div>
  );
}
