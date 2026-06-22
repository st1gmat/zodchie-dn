import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { getCategories } from "@/lib/categories";

export default async function Home() {
  const categories = await getCategories();

  return (
    <>
      <Hero categories={categories} />
      <CategoryGrid categories={categories} />
    </>
  );
}