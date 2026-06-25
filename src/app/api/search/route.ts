import { prisma } from "@/lib/db";
import { PRODUCT_PLACEHOLDER } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return Response.json({ products: [], categories: [] });
  }

  const contains = { contains: q, mode: "insensitive" as const };
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { title: contains },
          { brand: contains },
          { article: contains },
          { code: contains },
          { attributes: { some: { value: contains } } },
          { attributes: { some: { name: contains } } },
        ],
      },
      take: 6,
      orderBy: { title: "asc" },
      select: {
        slug: true,
        title: true,
        price: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        category: { select: { slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 5,
      orderBy: { title: "asc" },
      select: {
        slug: true,
        title: true,
        parent: { select: { title: true } },
      },
    }),
  ]);

  return Response.json({
    products: products.map((product) => ({
      slug: product.slug,
      title: product.title,
      price: product.price,
      categorySlug: product.category.slug,
      imageUrl: product.images[0]?.url ?? PRODUCT_PLACEHOLDER,
    })),
    categories: categories.map((category) => ({
      slug: category.slug,
      title: category.title,
      parentTitle: category.parent?.title ?? null,
    })),
  });
}
