"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

function ChevronLeft({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [open, setOpen] = useState(false);
  const current = images[active] ?? images[0];
  const hasMany = images.length > 1;

  const go = useCallback(
    (delta: number) => {
      setDir(delta >= 0 ? 1 : -1);
      setActive((prev) => (prev + delta + images.length) % images.length);
    },
    [images.length],
  );

  function selectThumb(index: number) {
    setDir(index >= active ? 1 : -1);
    setActive(index);
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
        <ImagePlaceholder />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
        <button
          key={active}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Открыть фото на весь экран"
          className={`absolute inset-0 cursor-zoom-in ${
            dir >= 0 ? "animate-slide-right" : "animate-slide-left"
          }`}
        >
          <Image
            src={current}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-10"
            priority
          />
        </button>

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/80 text-foreground opacity-0 shadow-sm backdrop-blur transition hover:border-accent-soft hover:text-accent-strong focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/80 text-foreground opacity-0 shadow-sm backdrop-blur transition hover:border-accent-soft hover:text-accent-strong focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground/70 px-2.5 py-0.5 text-xs font-medium text-white">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {hasMany && (
        <ul className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <li key={`${image}-${index}`}>
              <button
                type="button"
                onClick={() => selectThumb(index)}
                aria-label={`Фото ${index + 1}`}
                aria-current={index === active}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border bg-surface transition-colors ${
                  index === active
                    ? "border-accent-strong"
                    : "border-border hover:border-accent-soft"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Lightbox
          images={images}
          title={title}
          index={active}
          onIndexChange={setActive}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  title,
  index,
  onIndexChange,
  onClose,
}: {
  images: string[];
  title: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [dir, setDir] = useState(1);
  const current = images[index] ?? images[0];
  const hasMany = images.length > 1;

  const go = useCallback(
    (delta: number) => {
      setDir(delta >= 0 ? 1 : -1);
      onIndexChange((index + delta + images.length) % images.length);
      setZoom(null);
    },
    [index, images.length, onIndexChange],
  );

  // Lock body scroll and wire keyboard controls while open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  function toggleZoom(event: React.MouseEvent<HTMLDivElement>) {
    if (zoom) {
      setZoom(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  }

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!zoom) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {hasMany && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
            aria-label="Предыдущее фото"
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
            aria-label="Следующее фото"
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image stage — clicking it toggles zoom, not close. */}
      <div
        className={`relative h-[85vh] w-[92vw] max-w-5xl ${
          zoom ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={toggleZoom}
        onMouseMove={handleMove}
        onMouseLeave={() => setZoom(null)}
      >
        <div
          key={index}
          className={`absolute inset-0 ${
            zoom ? "" : dir >= 0 ? "animate-slide-right" : "animate-slide-left"
          }`}
        >
          <Image
            src={current}
            alt={title}
            fill
            sizes="92vw"
            className="object-contain transition-transform duration-200 ease-out"
            style={{
              transform: zoom ? "scale(2.5)" : "scale(1)",
              transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center",
            }}
            priority
          />
        </div>
      </div>

      {hasMany && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
