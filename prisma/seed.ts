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

// Demo nomenclature — placeholder catalog content until real products are
// imported (manually or from 1C). Prices in whole rubles. Keyed by category icon.
type SeedProduct = { title: string; price: number; inStock?: boolean };

const productsByIcon: Record<string, SeedProduct[]> = {
  faucets: [
    { title: "Смеситель для кухни с поворотным изливом", price: 4990 },
    { title: "Смеситель для раковины однорычажный", price: 3290 },
    { title: "Смеситель для ванны с душевым набором", price: 6790 },
    { title: "Термостатический смеситель для душа", price: 11900, inStock: false },
  ],
  toilets: [
    { title: "Унитаз-компакт напольный", price: 7990 },
    { title: "Унитаз подвесной с сиденьем микролифт", price: 9890 },
    { title: "Инсталляция для подвесного унитаза", price: 8490 },
    { title: "Комплект: инсталляция, унитаз и кнопка", price: 18900 },
  ],
  baths: [
    { title: "Ванна акриловая 170×70", price: 14900 },
    { title: "Ванна стальная 150×70", price: 9990 },
    { title: "Душевая кабина 90×90 с поддоном", price: 27900 },
    { title: "Душевой уголок 100×80", price: 16900, inStock: false },
  ],
  sinks: [
    { title: "Раковина накладная керамическая", price: 4290 },
    { title: "Раковина-тюльпан с пьедесталом", price: 5690 },
    { title: "Раковина встраиваемая 60 см", price: 4990 },
    { title: "Мойка кухонная нержавеющая", price: 3990 },
  ],
  pipes: [
    { title: "Труба полипропиленовая 20 мм (1 м)", price: 90 },
    { title: "Уголок полипропиленовый 20 мм", price: 35 },
    { title: "Тройник полипропиленовый 20 мм", price: 45 },
    { title: "Труба металлопластиковая 16 мм (1 м)", price: 120 },
  ],
  heating: [
    { title: "Водонагреватель накопительный 80 л", price: 16900 },
    { title: "Водонагреватель проточный 5.5 кВт", price: 5990 },
    { title: "Радиатор биметаллический, 8 секций", price: 6490 },
    { title: "Полотенцесушитель водяной", price: 4290 },
  ],
  furniture: [
    { title: "Тумба с раковиной 60 см", price: 12900 },
    { title: "Зеркало-шкаф с подсветкой", price: 7990 },
    { title: "Пенал для ванной комнаты", price: 8990 },
    { title: "Зеркало настенное 70×50", price: 3490 },
  ],
  fittings: [
    { title: "Сифон для раковины с переливом", price: 590 },
    { title: "Гибкая подводка для воды 1/2 (0.5 м)", price: 190 },
    { title: "Сифон для ванны автомат", price: 1290 },
    { title: "Набор аксессуаров для ванной", price: 2490 },
  ],
};

// Demo specifications applied to every product in a category. Placeholder
// values until real nomenclature is loaded. Keyed by category icon.
type SeedAttr = { name: string; value: string };

const specsByIcon: Record<string, SeedAttr[]> = {
  faucets: [
    { name: "Материал корпуса", value: "Латунь" },
    { name: "Тип монтажа", value: "На бортик" },
    { name: "Покрытие", value: "Хром" },
    { name: "Гарантия", value: "12 месяцев" },
  ],
  toilets: [
    { name: "Материал", value: "Санфаянс" },
    { name: "Система слива", value: "Двойная кнопка" },
    { name: "Сиденье", value: "Микролифт" },
    { name: "Гарантия", value: "24 месяца" },
  ],
  baths: [
    { name: "Материал", value: "Акрил" },
    { name: "Цвет", value: "Белый" },
    { name: "Слив-перелив", value: "В комплекте" },
    { name: "Гарантия", value: "24 месяца" },
  ],
  sinks: [
    { name: "Материал", value: "Керамика" },
    { name: "Тип установки", value: "Накладная" },
    { name: "Цвет", value: "Белый" },
    { name: "Отверстие под смеситель", value: "Есть" },
  ],
  pipes: [
    { name: "Материал", value: "Полипропилен" },
    { name: "Диаметр", value: "20 мм" },
    { name: "Рабочая температура", value: "до 70 °C" },
    { name: "Назначение", value: "Холодная и горячая вода" },
  ],
  heating: [
    { name: "Тип", value: "Накопительный" },
    { name: "Управление", value: "Механическое" },
    { name: "Установка", value: "Настенная" },
    { name: "Гарантия", value: "12 месяцев" },
  ],
  furniture: [
    { name: "Материал", value: "ЛДСП, влагостойкая" },
    { name: "Цвет", value: "Белый" },
    { name: "Монтаж", value: "Подвесной" },
    { name: "Гарантия", value: "12 месяцев" },
  ],
  fittings: [
    { name: "Материал", value: "Пластик" },
    { name: "Совместимость", value: "Универсальная" },
    { name: "Комплектация", value: "Крепёж в комплекте" },
  ],
};

// Subcategories per top-level category (keyed by icon). Child slugs are
// prefixed with the parent slug to stay globally unique.
const subsByIcon: Record<string, string[]> = {
  faucets: ["Для кухни", "Для ванной", "Для раковины", "Для душа"],
  toilets: ["Напольные", "Подвесные", "Инсталляции", "Безободковые"],
  baths: ["Акриловые ванны", "Стальные ванны", "Душевые кабины", "Душевые уголки"],
  sinks: ["Накладные", "Встраиваемые", "Тюльпаны", "Кухонные мойки"],
  pipes: ["Полипропилен", "Металлопластик", "Фитинги", "Краны и вентили"],
  heating: ["Накопительные", "Проточные", "Радиаторы", "Полотенцесушители"],
  furniture: ["Тумбы", "Зеркала", "Пеналы", "Шкафы"],
  fittings: ["Сифоны", "Подводка", "Аксессуары", "Крепёж"],
};

async function main() {
  for (const [index, category] of categories.entries()) {
    const data = {
      title: category.title,
      description: category.description,
      icon: category.icon,
      order: index,
    };
    const saved = await prisma.category.upsert({
      where: { slug: slugify(category.title) },
      update: data,
      create: { slug: slugify(category.title), ...data },
    });

    const subs = subsByIcon[category.icon] ?? [];
    for (const [subIndex, subTitle] of subs.entries()) {
      const subSlug = `${saved.slug}-${slugify(subTitle)}`;
      const subData = { title: subTitle, order: subIndex, parentId: saved.id };
      await prisma.category.upsert({
        where: { slug: subSlug },
        update: subData,
        create: { slug: subSlug, ...subData },
      });
    }

    const products = productsByIcon[category.icon] ?? [];
    const specs = specsByIcon[category.icon] ?? [];
    for (const [productIndex, product] of products.entries()) {
      const productData = {
        title: product.title,
        price: product.price,
        inStock: product.inStock ?? true,
        order: productIndex,
        categoryId: saved.id,
      };
      const savedProduct = await prisma.product.upsert({
        where: { slug: slugify(product.title) },
        update: productData,
        create: { slug: slugify(product.title), ...productData },
      });

      // Reset attributes so re-seeding stays idempotent (no business key to upsert on).
      await prisma.productAttribute.deleteMany({
        where: { productId: savedProduct.id },
      });
      if (specs.length > 0) {
        await prisma.productAttribute.createMany({
          data: specs.map((spec, specIndex) => ({
            name: spec.name,
            value: spec.value,
            order: specIndex,
            productId: savedProduct.id,
          })),
        });
      }
    }
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
