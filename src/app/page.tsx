import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { getCategories } from "@/lib/categories";

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Hero categories={categories} />
        <CategoryGrid categories={categories} />
      </main>
    </div>
  );
}