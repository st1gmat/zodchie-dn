import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  { title: "Смесители", description: "Для кухни, ванной и душа", icon: "faucets" },
  { title: "Унитазы и инсталляции", description: "Подвесные и напольные системы", icon: "toilets" },
  { title: "Ванны и душевые кабины", description: "Акрил, чугун, сталь", icon: "baths" },
  { title: "Раковины и тюльпаны", description: "Накладные и встраиваемые", icon: "sinks" },
  { title: "Трубы и фитинги", description: "Полипропилен и металлопластик", icon: "pipes" },
  { title: "Водонагреватели и радиаторы", description: "Тепло и горячая вода", icon: "heating" },
  { title: "Мебель для ванной", description: "Тумбы, зеркала, пеналы", icon: "furniture" },
  { title: "Фурнитура и аксессуары", description: "Шланги, сифоны, крепёж", icon: "fittings" },
];

async function main() {
  for (const [index, category] of categories.entries()) {
    const data = {
      title: category.title,
      description: category.description,
      icon: category.icon,
      order: index,
    };
    await prisma.category.upsert({
      where: { slug: slugify(category.title) },
      update: data,
      create: { slug: slugify(category.title), ...data },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
