import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { class: "w-7 h-7 text-xs", px: 28 },
  md: { class: "w-9 h-9 text-sm", px: 36 },
  lg: { class: "w-12 h-12 text-base", px: 48 },
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const { class: sizeClass, px } = sizes[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={cn(
          "rounded-full object-cover flex-shrink-0",
          sizeClass,
          className,
        )}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-brand-700 text-brand-200 font-semibold flex items-center justify-center flex-shrink-0",
        sizeClass,
        className,
      )}
    >
      {getInitials(name || "U")}
    </div>
  );
}
