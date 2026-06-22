---
name: project-zodchie-site-plan
description: Design direction and build approach for the zodchie-dn landing page (light/santehcentr-style, updated 2026-06-22)
metadata:
  type: project
---

Design direction chosen for the "Зодчие" plumbing-store landing page:
- **Visual style (updated 2026-06-22):** light palette, e-commerce-catalog-style structure inspired by https://www.santehcentr.com/ — white/light-gray background, dark text, warm brass/copper accent (`--accent` etc. in `src/app/globals.css`, now inverted from the original dark theme). Header has: top utility bar (address/hours/phone), main row (logo, nav, favorites+cart icon links, "Позвонить" button), and a horizontal category-name menu row below (from `categories` in `src/lib/site.ts`). Superseded the earlier "dark premium, deliberately not like competitors" direction from 2026-06-20 — user changed their mind after seeing santehcentr.com and explicitly asked to adopt its structure + light colors.
- **Cart/favorites icons:** currently decorative-only (link to `#catalog`, `title` tooltip "появится позже") — no real cart/wishlist logic exists yet; don't treat the icons as a sign that cart functionality is implemented.
- **Content:** placeholder copy/icons for now — no real product photos or logo yet. Don't fabricate fake stats/numbers (e.g. "10 years on market", review counts); generic marketing claims (delivery, consultation) are fine, factual-sounding numbers are not.
- **Build approach:** stepwise/iterative, not one giant page at once. First slice built (2026-06-20): `Header`, `Hero`, `CategoryGrid` (8 placeholder categories) in `src/components/`, config in `src/lib/site.ts`. Restyled to light/santehcentr-structure on 2026-06-22 (same components, no new sections).
- **Future scope (explicitly NOT now):** user wants an admin panel later to configure categories/images/etc. on the site itself, and a fuller catalog (cart, prices, comparison) like santehcentr.com — both deferred, current focus stays on the landing page only.
- **Still to build:** advantages/"why us" section, "about company" (using real legal info from [[project-business-info]]), contacts section with map, footer with legal/INN details. Real catalog page and admin panel are future scope (1C nomenclature import undecided per README/CLAUDE.md).

**Why:** user explicitly rejected a straight clone of nautilusdn.com on 2026-06-20, but on 2026-06-22 asked to adopt santehcentr.com's structure and light colors instead — direction is now light, not dark. Always confirmed scope/details via AskUserQuestion before implementing rather than assuming.
**How to apply:** Treat the light palette + santehcentr-style header structure as current truth, not the older dark-premium note (still useful for icon-style/whitespace conventions, just not colors). Continue checking in with the user before adding new sections or scope (catalog, admin panel).