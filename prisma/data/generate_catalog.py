# -*- coding: utf-8 -*-
"""
One-time generator: parse the 1C nomenclature export (memory/товары.xls) into a
committed JSON the seed reads (prisma/data/catalog.json).

We do this at build/author time (not in the app or seed) because the .xls lives
only locally (gitignored, not deployed) and needs the `xlrd` dependency. The
resulting JSON is committed, so `prisma db seed` works anywhere without the xls.

Run from the repo root:  python prisma/data/generate_catalog.py

The export columns (row 0 is the header):
  0 Номенклатура (short name)   3 Единица хранения (unit)   5 Артикул
  6 Вид номенклатуры (brand+type, messy)   8 Наименование для печати
"""
import json
import os
import re
import sys
from collections import Counter

import xlrd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
XLS = os.path.join(ROOT, "memory", "товары.xls")
OUT = os.path.join(HERE, "catalog.json")

# --- Customer-facing taxonomy (by product TYPE, not brand). ------------------
# slug -> metadata. `icon` matches a CategoryIcon in src/components/CategoryIcon.
CATEGORIES = [
    ("smesiteli", "Смесители", "Для кухни, ванной, раковины и душа", "faucets"),
    ("plitka", "Плитка и керамогранит", "Настенная, напольная, мозаика и декор", "tile"),
    ("unitazy", "Унитазы и инсталляции", "Компакты, подвесные, биде и инсталляции", "toilets"),
    ("rakoviny", "Раковины и умывальники", "Накладные, встраиваемые, тюльпаны", "sinks"),
    ("vanny", "Ванны", "Акриловые, стальные, чугунные", "baths"),
    ("dushevye", "Душевые кабины и ограждения", "Кабины, уголки, двери, поддоны", "shower"),
    ("mebel", "Мебель для ванной", "Тумбы, зеркала, пеналы, шкафы", "furniture"),
    ("polotencesushiteli", "Полотенцесушители", "Водяные и электрические", "towel"),
    ("vodonagrevateli", "Водонагреватели и отопление", "Бойлеры, радиаторы, обогрев", "heating"),
    ("moyki", "Кухонные мойки", "Нержавейка, гранит, керамика", "kitchen"),
    ("sifony", "Сифоны, трапы и арматура", "Сливы, трапы, желоба, механизмы", "drain"),
    ("aksessuary", "Аксессуары для ванной", "Держатели, полки, дозаторы, крючки", "accessory"),
    ("komplektuyushchie", "Шланги, подводки, комплектующие", "Подводки, гофры, картриджи", "pipes"),
    ("osveshchenie", "Освещение и электрика", "Лампы, светильники, фурнитура", "lighting"),
    ("materialy", "Отделочные материалы", "Двери, панели, ламинат, герметики", "materials"),
    ("prochee", "Прочее", "Разные товары и комплектующие", None),
]
CATEGORY_ORDER = [slug for slug, *_ in CATEGORIES]

# --- Keyword groups (checked against the lowercased «Вид номенклатуры»/name). -
# Order matters: earlier groups win. Combined kinds like "шланги, подводки,
# смесители" resolve to hoses because that group is checked before faucets.
KEYWORD_RULES = [
    ("aksessuary", ["аксессуар"]),
    ("polotencesushiteli", ["полотенцесуш"]),
    ("komplektuyushchie", ["шланг", "подводк", "гофр", "комплектующ", "картридж"]),
    ("sifony", ["сифон", "трап", "желоб", "арматур", "клапан", "механизм", "слив"]),
    ("moyki", ["мойк"]),
    ("mebel", ["мебель"]),
    ("dushevye", ["душев", "душ.каб", "душ.к", "душ кабин", "ограждени"]),
    ("vanny", ["ванн"]),
    ("vodonagrevateli", ["бойлер", "водонагрев", "радиатор", "отоплен"]),
    ("smesiteli", ["смесит"]),
    ("unitazy", ["унитаз", "компакт", "инсталляц", "биде", "писсуар"]),
    ("rakoviny", ["раковин", "умывальник", "тюльпан"]),
    ("plitka", ["грес", "керамогранит", "плитк", "мозаик", "керамическ"]),
    ("osveshchenie", ["лампы", "лампа", "светильник", "светодиод", "электрофурнитура",
                       "электрик", "батарейк", "вентилятор", "автоматика", "прожектор"]),
    ("materialy", ["двери", "наличник", "короб", "панел", "ламинат", "подложк",
                   "паркет", "герметик", "грунтовк", "гидроизол", "стройхими",
                   "профил", "плинтус", "затирк"]),
]

# Exact «Вид номенклатуры» → category for single-type brands the keyword rules
# can't catch (brand-only kinds, or a Latin type word like "ELECTRIC"). Checked
# first. Only unambiguous single-category makers go here; multi-type brands
# (AZARIO, FRAP…) are left to the keyword/unit/name rules.
KIND_CATEGORY = {
    # Ceramics-only makers (tiles, порцелан, керамогранит, мозаика).
    "ALMA CERAMICA": "plitka", "DELACORA": "plitka", "UNITILE": "plitka",
    "ITALON": "plitka", "KERAMA MARAZZI": "plitka", "ESTIMA": "plitka",
    "PiezaROSA": "plitka", "AXIMA": "plitka", "Mir Mosaic": "plitka",
    "Kalebodur": "plitka", "ProGRES Ceramica": "plitka", "PROTILES": "plitka",
    "GRESSE": "plitka", "AltaCera": "plitka", "ECOCERAMIC": "plitka",
    "NewTrend": "plitka", "VENTA": "plitka", "Artkera": "plitka", "LCM": "plitka",
    "BERYOZA CERAMICA": "plitka", "Euro-Ceramics": "plitka", "VENIS": "plitka",
    "RAK": "plitka", "APARICI": "plitka", "ATLAS CONCORDE Russia": "plitka",
    "Lasselsberger ceramics": "plitka", "AZTECA": "plitka", "STEPPE": "plitka",
    "GRES DE ARAGON": "plitka", "CreoCeramique": "plitka", "Иран": "plitka",
    "KASTAMONU": "plitka",
    # Bathtubs.
    "RADOMIR": "vanny", "1Marka": "vanny", "TOLERO GELCOAT": "vanny",
    # Shower enclosures.
    "RADAWAY": "dushevye",
    # Towel warmers.
    "HeatWave": "polotencesushiteli", "TERMA": "polotencesushiteli",
    # Faucets whose kind has a Latin lookalike letter ("cмесители").
    "MAIDU cмесители": "smesiteli",
    # Bathroom furniture.
    "COMFORTY": "mebel",
    # Lighting / electrics (Latin "ELECTRIC" isn't matched by Cyrillic keywords).
    "SYSTEME ELECTRIC": "osveshchenie", "ST-Luce": "osveshchenie",
    # Finishing / building materials.
    "Aluminum profiles": "materialy", "KRONO ORIGINAL": "materialy",
    "FLOORPAN": "materialy", "TARKETT SOMMER": "materialy",
    "ROYALWOOD": "materialy", "EUROSHRINK": "materialy", "DECOR-DIZAYN": "materialy",
}

# Footer/summary rows in the export we must not import as products.
SKIP_NAMES = {"итого", "всего", "итого:"}

# Type words stripped from «Вид номенклатуры» to isolate the brand.
BRAND_STRIP = re.compile(
    r"(смесител\w*|аксессуар\w*|полотенцесушител\w*|шланг\w*|подводк\w*|гофр\w*|"
    r"комплектующ\w*|картридж\w*|сифон\w*|трап\w*|желоб\w*|арматур\w*|клапан\w*|"
    r"механизм\w*|мойк\w*|мебель\w*|душев\w*|ванн\w*|бойлер\w*|водонагрев\w*|"
    r"радиатор\w*|унитаз\w*|компакт\w*|инсталляц\w*|биде|писсуар\w*|раковин\w*|"
    r"умывальник\w*|тюльпан\w*|грес|керамогранит\w*|плитк\w*|мозаик\w*|лампы|"
    r"светильник\w*|светодиод\w*|электрофурнитур\w*|батарейк\w*|вентилятор\w*|"
    r"автоматик\w*|двери|наличник\w*|короб\w*|панел\w*|ламинат\w*|подложк\w*|"
    r"герметик\w*|грунтовк\w*|гидроизол\w*|сантехник\w*|затирк\w*|светильники разные|"
    r"д/вк|в в/к|для ванных комнат|для ванной комнаты|сифоны, трапы, желоба)",
    re.IGNORECASE,
)

# «Вид номенклатуры» values that are countries/regions, not brands.
COUNTRIES = {"иран", "китай", "индия", "россия", "китай_az"}


def classify(kind, kind_l, name_l, unit):
    """Return a category slug for one row."""
    # Exact single-type brand override wins first.
    if kind in KIND_CATEGORY:
        return KIND_CATEGORY[kind]

    # Ambiguous "унитазы,раковины" style kinds — split by the item name.
    if ("унитаз" in kind_l or "раковин" in kind_l) and (
        "унитаз" in kind_l and "раковин" in kind_l
    ):
        if any(w in name_l for w in ("раковина", "умывальник", "тюльпан", "мойка")):
            return "rakoviny"
        if any(w in name_l for w in ("унитаз", "компакт", "биде", "писсуар", "бачок")):
            return "unitazy"

    for slug, words in KEYWORD_RULES:
        if any(w in kind_l for w in words):
            return slug

    # Building materials sold by m² shouldn't fall into tile.
    if any(w in name_l for w in ("ламинат", "подложк", "паркет", "плинтус")):
        return "materialy"

    if unit == "м2":
        return "plitka"

    # Fall back to the product name.
    for slug, words in KEYWORD_RULES:
        if any(w in name_l for w in words):
            return slug

    return "prochee"


def extract_brand(kind):
    """Best-effort brand from «Вид номенклатуры» (type words removed)."""
    if not kind:
        return None
    if kind.strip().lower() in COUNTRIES:
        return None
    stripped = BRAND_STRIP.sub(" ", kind)
    # Drop leftover separators/punctuation and collapse whitespace.
    stripped = re.sub(r"[,;/()]+", " ", stripped)
    stripped = re.sub(r"\s+", " ", stripped).strip(" -,")
    if not stripped or stripped.lower() in COUNTRIES:
        return None
    # A leftover that is purely lowercase Russian is a stray type word, not a brand.
    if re.fullmatch(r"[а-яё\s\-]+", stripped) and stripped == stripped.lower():
        return None
    return stripped


def main():
    if not os.path.exists(XLS):
        sys.exit("xls not found: %s" % XLS)

    book = xlrd.open_workbook(XLS)
    sheet = book.sheet_by_index(0)

    products = []
    cat_counts = Counter()
    brand_counts = Counter()
    unmatched = []

    for r in range(1, sheet.nrows):
        name = str(sheet.cell_value(r, 0)).strip()
        unit = str(sheet.cell_value(r, 3)).strip()
        article = str(sheet.cell_value(r, 5)).strip()
        kind = str(sheet.cell_value(r, 6)).strip()
        print_name = str(sheet.cell_value(r, 8)).strip()
        if not name or name.strip().lower() in SKIP_NAMES:
            continue

        title = print_name or name
        kind_l = kind.lower()
        name_l = (name + " " + print_name).lower()

        slug = classify(kind, kind_l, name_l, unit)
        brand = extract_brand(kind)

        cat_counts[slug] += 1
        if brand:
            brand_counts[brand] += 1
        if slug == "prochee":
            unmatched.append(kind or name)

        products.append({
            "title": title,
            "article": article or None,
            "brand": brand,
            "unit": unit or None,
            "categorySlug": slug,
        })

    data = {
        "categories": [
            {"slug": s, "title": t, "description": d, "icon": i, "order": idx}
            for idx, (s, t, d, i) in enumerate(CATEGORIES)
        ],
        "products": products,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    # Report to a UTF-8 file (Windows console can't print Cyrillic reliably).
    report = os.path.join(HERE, "catalog_report.txt")
    with open(report, "w", encoding="utf-8") as f:
        f.write("TOTAL products: %d\n\n=== BY CATEGORY ===\n" % len(products))
        for slug in CATEGORY_ORDER:
            f.write("%6d  %s\n" % (cat_counts[slug], slug))
        f.write("\n=== TOP BRANDS (%d unique) ===\n" % len(brand_counts))
        for b, c in brand_counts.most_common(60):
            f.write("%6d  %s\n" % (c, b))
        f.write("\n=== SAMPLE 'prochee' kinds (%d total) ===\n" % len(unmatched))
        for k in list(dict.fromkeys(unmatched))[:60]:
            f.write("  %s\n" % k)

    print("wrote", OUT, "with", len(products), "products")


if __name__ == "__main__":
    main()
