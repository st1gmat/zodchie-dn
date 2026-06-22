import { siteConfig } from "@/lib/site";

const highlights = [
  "Доставка по Донецку",
  "Помощь в подборе оборудования",
  "Работаем с частными и юр. лицами",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", opacity: 0.18 }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-soft">
          {siteConfig.legalName} · {siteConfig.city}
        </p>

        <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {siteConfig.tagline}
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Смесители, сантехника, отопление и всё для ремонта ванной —
          от проверенных производителей, с консультацией по выбору
          и расчётом нужного количества.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#catalog"
            className="rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
          >
            Смотреть каталог
          </a>
          <a
            href={siteConfig.phoneHref}
            className="rounded-full border border-border px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft"
          >
            {siteConfig.phone}
          </a>
        </div>

        <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}