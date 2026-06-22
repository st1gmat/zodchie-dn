import { prisma } from "@/lib/db";

export type CategoryView = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
};

/** Top-level categories for the landing page, ordered for display. */
export async function getCategories(): Promise<CategoryView[]> {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true, description: true, icon: true },
  });
}
