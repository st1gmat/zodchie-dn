"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import {
  verifyPassword,
  createSession,
  destroySession,
  requireAdmin,
} from "@/lib/auth";

// Revalidate the storefront (static "/" and "/catalog") after any content change.
function refreshPublic() {
  revalidatePath("/", "layout");
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (await verifyPassword(password)) {
    await createSession();
    redirect("/admin");
  }
  redirect("/admin/login?error=1");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

const categorySchema = z.object({
  title: z.string().trim().min(1, "Укажите название"),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  order: z.coerce.number().int().default(0),
});

function readCategory(formData: FormData) {
  return categorySchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    order: formData.get("order") || 0,
  });
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const data = readCategory(formData);
  await prisma.category.create({
    data: {
      slug: slugify(data.title),
      title: data.title,
      description: data.description ?? null,
      icon: data.icon ?? null,
      order: data.order,
    },
  });
  refreshPublic();
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = readCategory(formData);
  // Slug is left unchanged on edit so existing URLs keep working.
  await prisma.category.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? null,
      icon: data.icon ?? null,
      order: data.order,
    },
  });
  refreshPublic();
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.category.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/categories");
}

const productSchema = z.object({
  title: z.string().trim().min(1, "Укажите название"),
  categoryId: z.string().min(1, "Выберите категорию"),
  price: z.coerce.number().int().min(0),
  description: z.string().trim().optional(),
  inStock: z.boolean(),
  order: z.coerce.number().int().default(0),
});

function readProduct(formData: FormData) {
  return productSchema.parse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price") || 0,
    description: formData.get("description") || undefined,
    inStock: formData.get("inStock") === "on",
    order: formData.get("order") || 0,
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = readProduct(formData);
  await prisma.product.create({
    data: {
      slug: slugify(data.title),
      title: data.title,
      price: data.price,
      inStock: data.inStock,
      description: data.description ?? null,
      order: data.order,
      categoryId: data.categoryId,
    },
  });
  refreshPublic();
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = readProduct(formData);
  await prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      price: data.price,
      inStock: data.inStock,
      description: data.description ?? null,
      order: data.order,
      categoryId: data.categoryId,
    },
  });
  refreshPublic();
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.product.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/products");
}
