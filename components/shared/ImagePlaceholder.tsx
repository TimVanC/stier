import { cn } from "@/lib/utils";

/**
 * Placeholder for product/category imagery while real images aren't seeded.
 * Renders a hatch pattern with a small uppercase label.
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
        "bg-hatch relative flex items-end justify-center overflow-hidden bg-secondary",
        className,
      )}
    >
      <span className="pointer-events-none absolute bottom-3 left-0 right-0 px-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
