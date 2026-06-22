"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
        <Image
          src={current}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-10"
          priority
        />
      </div>

      {images.length > 1 && (
        <ul className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <li key={`${image}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
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
    </div>
  );
}
