import { prisma } from "@/lib/db";

/** Shown for products that have no photo yet (e.g. fresh 1C nomenclature). */
export const PRODUCT_PLACEHOLDER = "/images/product-placeholder.png";

export type ProductCardView = {
  id: string;
  slug: string;
  title: string;
  price: number;
  inStock: boolean;
  // Ordered image URLs (at least one — a placeholder when the product has no
  // photos). The card lets users flip through them on hover.
  images: string[];
  // The product's own category slug, so links resolve even when a parent
  // category page aggregates products that live in its subcategories.
  categorySlug: string;
};

function toCardImages(images: { url: string }[]): string[] {
  return images.length > 0 ? images.map((image) => image.url) : [PRODUCT_PLACEHOLDER];
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

export type CategoryDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  parent: { slug: string; title: string } | null;
  children: { id: string; slug: string; title: string }[];
  products: ProductCardView[];
};

/**
 * A category for the listing page. Products include the category's own plus
 * those of its subcategories, so a parent page aggregates everything beneath it.
 */
export async function getCategoryDetail(
  slug: string,
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
  const products = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds } },
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
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

  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    parent: category.parent,
    children: category.children,
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
    images: images.length > 0 ? images : [PRODUCT_PLACEHOLDER],
    attributes: product.attributes,
    category: product.category,
  };
}
