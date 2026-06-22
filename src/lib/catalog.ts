import { prisma } from "@/lib/db";

/** Shown for products that have no photo yet (e.g. fresh 1C nomenclature). */
export const PRODUCT_PLACEHOLDER = "/images/product-placeholder.png";

export type ProductCardView = {
  id: string;
  slug: string;
  title: string;
  price: number;
  inStock: boolean;
  imageUrl: string;
};

export type CategoryDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  products: ProductCardView[];
};

/** A category with its products (ordered), for the category listing page. */
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
      products: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          inStock: true,
          images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  if (!category) return null;

  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    products: category.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      inStock: product.inStock,
      imageUrl: product.images[0]?.url ?? PRODUCT_PLACEHOLDER,
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
    images: images.length > 0 ? images : [PRODUCT_PLACEHOLDER],
    attributes: product.attributes,
    category: product.category,
  };
}
