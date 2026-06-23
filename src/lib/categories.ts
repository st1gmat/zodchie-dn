import { prisma } from "@/lib/db";

export type SubcategoryView = {
  id: string;
  slug: string;
  title: string;
};

export type CategoryView = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  children: SubcategoryView[];
};

/** Top-level categories (with their subcategories) for the landing page. */
export async function getCategories(): Promise<CategoryView[]> {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      icon: true,
      children: {
        orderBy: { order: "asc" },
        select: { id: true, slug: true, title: true },
      },
    },
  });
}

export type CategoryOption = { id: string; title: string; depth: number };

/** Flat parent-then-children list for admin <select> inputs (children indented). */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const parents = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      children: {
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });

  const options: CategoryOption[] = [];
  for (const parent of parents) {
    options.push({ id: parent.id, title: parent.title, depth: 0 });
    for (const child of parent.children) {
      options.push({ id: child.id, title: child.title, depth: 1 });
    }
  }
  return options;
}
