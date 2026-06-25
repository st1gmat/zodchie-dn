import { Hero } from "@/components/Hero";
import { ProductShowcase } from "@/components/ProductShowcase";
import { getCategories } from "@/lib/categories";
import { getShowcaseProducts } from "@/lib/catalog";

// Render on each request (reads the DB) — avoids needing a database at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getShowcaseProducts(),
  ]);

  return (
    <>
      <Hero categories={categories} />
      <ProductShowcase products={products} />
    </>
  );
}
