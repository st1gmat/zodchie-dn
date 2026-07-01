import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Real catalog, generated from the 1C export (memory/товары.xls) by
// prisma/data/generate_catalog.py. Committed so the seed runs anywhere without
// the .xls or its Python toolchain. Regenerate that JSON when the export changes.
type SeedCategory = {
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  order: number;
};
type SeedProduct = {
  title: string;
  article: string | null;
  brand: string | null;
  unit: string | null;
  categorySlug: string;
};
type Catalog = { categories: SeedCategory[]; products: SeedProduct[] };

const catalog: Catalog = JSON.parse(
  readFileSync(new URL("./data/catalog.json", import.meta.url), "utf-8"),
);

// Product slugs come from the (long, sometimes duplicated) print names, so we
// truncate and disambiguate to keep them unique and URL-friendly.
const usedSlugs = new Map<string, number>();
function uniqueSlug(title: string): string {
  const base = slugify(title).slice(0, 80) || "tovar";
  const seen = usedSlugs.get(base) ?? 0;
  usedSlugs.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen + 1}`;
}

async function chunked<T>(rows: T[], size: number, run: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) {
    await run(rows.slice(i, i + size));
  }
}

async function main() {
  // Fresh reseed. Order respects FKs (products before their categories).
  await prisma.productImage.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.category.deleteMany();

  // Categories (flat, type-based taxonomy derived from the export).
  const categoryIdBySlug = new Map<string, string>();
  for (const category of catalog.categories) {
    const created = await prisma.category.create({
      data: {
        slug: category.slug,
        title: category.title,
        description: category.description ?? undefined,
        icon: category.icon ?? undefined,
        order: category.order,
      },
      select: { id: true, slug: true },
    });
    categoryIdBySlug.set(created.slug, created.id);
  }

  // Products. Prices aren't in the export → 0, shown as «Цена по запросу».
  const items = catalog.products.map((product, index) => {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) throw new Error(`Unknown category: ${product.categorySlug}`);
    const slug = uniqueSlug(product.title);
    return {
      slug,
      unit: product.unit,
      record: {
        slug,
        title: product.title,
        price: 0,
        inStock: true,
        brand: product.brand ?? null,
        article: product.article ?? null,
        categoryId,
        order: index,
      },
    };
  });

  await chunked(items, 1000, (batch) =>
    prisma.product.createMany({ data: batch.map((item) => item.record) }),
  );

  // Attach the unit of measure (шт / м²) as a characteristic. createMany can't
  // return ids, so map slug→id after insert, then bulk-insert the attributes.
  const created = await prisma.product.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(created.map((p) => [p.slug, p.id]));
  const unitAttributes = items
    .filter((item) => item.unit)
    .map((item) => ({
      name: "Единица измерения",
      value: item.unit === "м2" ? "м²" : (item.unit as string),
      order: 0,
      productId: idBySlug.get(item.slug) as string,
    }));
  await chunked(unitAttributes, 1000, (batch) =>
    prisma.productAttribute.createMany({ data: batch }),
  );

  console.log(
    `Seeded ${catalog.categories.length} categories and ${items.length} products.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
