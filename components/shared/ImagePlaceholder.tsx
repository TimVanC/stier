import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Placeholder for product/category imagery while real images aren't seeded.
 * Renders a hatch pattern with a centered motif + label so it reads as an
 * intentional placeholder rather than an empty box.
 */
export function ImagePlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-hatch relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-secondary text-muted-foreground",
        className,
      )}
    >
      <ImageIcon className="size-1/4 max-h-10 min-h-5 opacity-40" />
      {label ? (
        <span className="pointer-events-none max-w-[90%] text-center text-[10px] font-medium uppercase tracking-wider opacity-80">
          {label}
        </span>
      ) : null}
    </div>
  );
}
