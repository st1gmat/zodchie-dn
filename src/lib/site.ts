export const siteConfig = {
  name: "Зодчие",
  legalName: "ООО «Торговый дом «Зодчие»»",
  tagline: "Сантехника и инженерное оборудование для дома",
  city: "Донецк",
  address: "г. Донецк, ул. Кирова, 90",
  // TODO: заменить на реальные контакты магазина
  phone: "+7 (949) 000-00-00",
  phoneHref: "tel:+79490000000",
  workingHours: "Ежедневно, 9:00–18:00",
  inn: "9302008620",
  ogrn: "1229300150716",
};

export type Category = {
  id: string;
  title: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: "faucets",
    title: "Смесители",
    description: "Для кухни, ванной и душа",
  },
  {
    id: "toilets",
    title: "Унитазы и инсталляции",
    description: "Подвесные и напольные системы",
  },
  {
    id: "baths",
    title: "Ванны и душевые кабины",
    description: "Акрил, чугун, сталь",
  },
  {
    id: "sinks",
    title: "Раковины и тюльпаны",
    description: "Накладные и встраиваемые",
  },
  {
    id: "pipes",
    title: "Трубы и фитинги",
    description: "Полипропилен и металлопластик",
  },
  {
    id: "heating",
    title: "Водонагреватели и радиаторы",
    description: "Тепло и горячая вода",
  },
  {
    id: "furniture",
    title: "Мебель для ванной",
    description: "Тумбы, зеркала, пеналы",
  },
  {
    id: "fittings",
    title: "Фурнитура и аксессуары",
    description: "Шланги, сифоны, крепёж",
  },
];