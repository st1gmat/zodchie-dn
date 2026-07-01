/** Shown in place of a product photo when the product has no images yet. */
export function ImagePlaceholder({ size = "lg" }: { size?: "sm" | "lg" }) {
  const compact = size === "sm";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-surface to-surface-soft text-muted">
      <CameraIcon className={compact ? "h-8 w-8" : "h-12 w-12"} />
      <span
        className={`px-4 text-center font-medium leading-snug ${
          compact ? "text-[11px]" : "text-sm"
        }`}
      >
        Фото скоро появится
      </span>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2l1-2h9l1 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}
