"use client";

import { useState } from "react";
import type { CategoryView } from "@/lib/categories";

export function CatalogSidebar({ categories }: { categories: CategoryView[] }) {
  const [open, setOpen] = useState(true);

  return (
    <aside className="hidden w-80 shrink-0 lg:block">
      <div className="rounded-2xl border border-border bg-background shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between border-b border-border px-5 py-5 text-sm font-semibold uppercase tracking-[0.1em] text-foreground"
        >
          Каталог
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <nav>
              <ul className="py-2 text-sm text-muted">
                {categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href="#catalog"
                      className="block px-5 py-3 transition-colors hover:bg-surface-soft hover:text-accent-soft"
                    >
                      {category.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
