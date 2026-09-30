# Site-p-doctor-

طراحی سایت معرفی و فروش پلاگین CPMS.

- **THEME:** کوروش (`koorosh`) — standalone lightweight custom WordPress theme.
- **AUTHORING:** Elementor + Elementor Pro.
- **GIT:** canonical theme, design tokens, reconstruction assets.
- **PUBLIC CI:** Koorosh + Elementor Free compatibility/reconstruction smoke.
- **PRIVATE ACCEPTANCE:** Elementor Pro + kit export/import + authorized test host.
- **TEST-HOST TRANSFER:** CI builds an installable Koorosh ZIP (test build, not a release) — see [docs/TEST-HOST-TRANSFER.md](docs/TEST-HOST-TRANSFER.md).
- **REFERENCE HOST:** recorded versions are test/evidence facts, not architecture locks.


## Site shell — navigation & conversion routing

WordPress-native menus (`primary`/`footer`), the Koorosh fallback sales header (identity + nav + persistent `/demo/` CTA, accessible mobile toggle and workflows submenu) and the `/` ↔ `/product-overview/` ↔ `/demo/` conversion routes are reconstructed in CI from [reconstruction/site-shell](reconstruction/site-shell/README.md) (`menu.mjs` canonical definition, `tests/browser/site-shell.mjs` runner). The global FAQ / buyer-objection page (`/faq/`) is discovered from the footer trust group only, and the compact primary navigation is unchanged. Elementor Pro Theme Builder location precedence is preserved.

## Homepage — Milestone A

The first Persian/RTL homepage is reconstructed as native **Elementor Free** content, not hardcoded theme markup. See [reconstruction instructions](reconstruction/homepage/README.md), [claim boundaries](reconstruction/homepage/claims.md), and the [Milestone A evidence/limitations](docs/MILESTONE-A-HOMEPAGE.md).

Development/CI only. Verified product media, a real demo/contact route, launch-truth approval, and visual acceptance are still required. The authorized Pro host pilot remains **NOT RUN**.
