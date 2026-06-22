"use client";

import { useState } from "react";
import { siteConfig, categories } from "@/lib/site";

const navLinks = [{ href: "#catalog", label: "Каталог" }];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="hidden border-b border-border/60 bg-surface/60 sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-muted">
          <span>{siteConfig.address}</span>
          <div className="flex items-center gap-6">
            <span>{siteConfig.workingHours}</span>
            <a
              href={siteConfig.phoneHref}
              className="font-medium text-foreground transition-colors hover:text-accent-soft"
            >
              {siteConfig.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="flex items-center gap-2 text-xl font-semibold tracking-[0.15em] text-foreground"
        >
          {siteConfig.name.toUpperCase()}
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </a>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href="#catalog"
            title="Избранное появится позже"
            className="text-muted transition-colors hover:text-accent-soft"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 19s-7.5-4.6-9.3-9.6C.6 6 2 3 5.2 3c2 0 3.4 1.1 4.3 2.3a1 1 0 0 0 1 0C11.4 4.1 12.8 3 14.8 3 18 3 19.4 6 18.3 9.4 16.5 14.4 11 19 11 19Z" />
            </svg>
          </a>
          <a
            href="#catalog"
            title="Корзина появится позже"
            className="text-muted transition-colors hover:text-accent-soft"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4h2l1.6 11.2A2 2 0 0 0 7.6 17h9.3a2 2 0 0 0 2-1.6L20 7H5" />
              <circle cx="8" cy="20" r="1.3" />
              <circle cx="16" cy="20" r="1.3" />
            </svg>
          </a>
          <a
            href={siteConfig.phoneHref}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
          >
            Позвонить
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center justify-center rounded-md border border-border p-2 text-foreground md:hidden"
          aria-label="Открыть меню"
          aria-expanded={open}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M5 5l12 12M17 5L5 17" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="hidden border-t border-border bg-surface/60 md:block">
        <nav className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6 py-2.5 text-sm text-muted">
          {categories.map((category) => (
            <a
              key={category.id}
              href="#catalog"
              className="shrink-0 whitespace-nowrap transition-colors hover:text-accent-soft"
            >
              {category.title}
            </a>
          ))}
        </nav>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4 text-sm text-muted">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={siteConfig.phoneHref}
                className="font-medium text-accent-soft"
              >
                {siteConfig.phone}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}