import Image from "next/image";
import { PhotoDTO } from "@/lib/db/queries";

export interface BlurBackdropProps {
  photo: PhotoDTO;
  brightness?: number;
  className?: string;
}

export function BlurBackdrop({
  photo,
  brightness = 0.65,
  className = "",
}: BlurBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
    >
      <div
        className="absolute -inset-10 bg-cover bg-center filter blur-3xl scale-125 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${photo.displayKey})`,
          filter: `blur(40px) brightness(${brightness})`,
        }}
      />
      <div className="absolute inset-0 bg-[var(--bg)]/40" />
    </div>
  );
}
