import { prisma } from "@/lib/db";

export type ProductCardView = {
  id: string;
  slug: string;
  title: string;
  price: number;
  inStock: boolean;
  // Ordered image URLs. May be empty — products with no photos yet (e.g. fresh
  // 1C nomenclature) render an "image coming soon" placeholder instead.
  images: string[];
  // The product's own category slug, so links resolve even when a parent
  // category page aggregates products that live in its subcategories.
  categorySlug: string;
};

function toCardImages(images: { url: string }[]): string[] {
  return images.map((image) => image.url);
}

/** A random selection of products for the homepage showcase. */
export async function getShowcaseProducts(
  limit = 24,
): Promise<ProductCardView[]> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      inStock: true,
      images: { orderBy: { order: "asc" }, take: 8, select: { url: true } },
      category: { select: { slug: true } },
    },
  });

  // Fisher–Yates shuffle, then take the first `limit`.
  for (let i = products.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [products[i], products[j]] = [products[j], products[i]];
  }

  return products.slice(0, limit).map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    inStock: product.inStock,
    images: toCardImages(product.images),
    categorySlug: product.category.slug,
  }));
}

/** How many products per catalog page. */
export const PRODUCTS_PER_PAGE = 24;

export type BrandFacet = { name: string; count: number };

export type CatalogFilters = {
  page?: number;
  brand?: string;
  inStockOnly?: boolean;
};

export type CategoryDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  parent: { slug: string; title: string } | null;
  children: { id: string; slug: string; title: string }[];
  products: ProductCardView[];
  // Facets + pagination for the listing page.
  brands: BrandFacet[];
  total: number;
  page: number;
  pageCount: number;
};

/**
 * A category for the listing page, with pagination and brand/in-stock filters.
 * Products include the category's own plus those of its subcategories, so a
 * parent page aggregates everything beneath it.
 */
export async function getCategoryDetail(
  slug: string,
  filters: CatalogFilters = {},
): Promise<CategoryDetail | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      parent: { select: { slug: true, title: true } },
      children: {
        orderBy: { order: "asc" },
        select: { id: true, slug: true, title: true },
      },
    },
  });

  if (!category) return null;

  const categoryIds = [category.id, ...category.children.map((child) => child.id)];

  // Brand facet reflects the in-stock filter but NOT the brand filter, so the
  // user can still switch to another brand within the same category.
  const facetWhere = {
    categoryId: { in: categoryIds },
    ...(filters.inStockOnly ? { inStock: true } : {}),
  };
  const listWhere = {
    ...facetWhere,
    ...(filters.brand ? { brand: filters.brand } : {}),
  };

  const [total, brandGroups] = await Promise.all([
    prisma.product.count({ where: listWhere }),
    prisma.product.groupBy({
      by: ["brand"],
      where: facetWhere,
      _count: { brand: true },
      orderBy: { _count: { brand: "desc" } },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount);

  const products = await prisma.product.findMany({
    where: listWhere,
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    skip: (page - 1) * PRODUCTS_PER_PAGE,
    take: PRODUCTS_PER_PAGE,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      inStock: true,
      images: { orderBy: { order: "asc" }, take: 8, select: { url: true } },
      category: { select: { slug: true } },
    },
  });

  const brands: BrandFacet[] = brandGroups
    .filter((group) => group.brand)
    .map((group) => ({ name: group.brand as string, count: group._count.brand }));

  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    parent: category.parent,
    children: category.children,
    brands,
    total,
    page,
    pageCount,
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      inStock: product.inStock,
      images: toCardImages(product.images),
      categorySlug: product.category.slug,
    })),
  };
}

export type ProductAttributeView = { name: string; value: string };

export type ProductDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  inStock: boolean;
  code: string | null;
  brand: string | null;
  article: string | null;
  images: string[];
  attributes: ProductAttributeView[];
  category: { slug: string; title: string };
};

/**
 * A single product, validated to live under `categorySlug`. Returns null when
 * the product is missing or its category doesn't match (avoids duplicate URLs).
 */
export async function getProductDetail(
  categorySlug: string,
  productSlug: string,
): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      inStock: true,
      code: true,
      brand: true,
      article: true,
      images: { orderBy: { order: "asc" }, select: { url: true } },
      attributes: { orderBy: { order: "asc" }, select: { name: true, value: true } },
      category: { select: { slug: true, title: true } },
    },
  });

  if (!product || product.category.slug !== categorySlug) return null;

  const images = product.images.map((image) => image.url);

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: product.price,
    inStock: product.inStock,
    code: product.code,
    brand: product.brand,
    article: product.article,
    images,
    attributes: product.attributes,
    category: product.category,
  };
}
