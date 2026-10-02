# PR #32 — ZIP-to-preview map

## Active visual source

The complete visual and content reference is the owner-provided archive `modern-glassmorphic-plugin-website (2).zip`, fetched from `origin/main` at the recorded SHA-256 `bbc614c937375eaf903166b824adfa77b55676444917544bfcfdc5cab74d5613`. This replaces the earlier blue/cyan reference and any earlier section-count or no-green requirement.

`visual-preview/index.html` is the Vite single-file build of the ZIP's React page. It preserves the supplied Persian RTL layout, mint/emerald glass styling, mock UI/data, marketing copy, section order, responsive behavior, animations and interactions. The small preview-only adaptations are documented in `visual-preview/README.md` and applied reproducibly by `scripts/build-zip-preview.py`.

## ZIP component → preview

| ZIP source | Preview result | Boundary |
| --- | --- | --- |
| `src/App.tsx` and 18 components | Same one-page section structure in the compiled homepage | Content and mock behavior are taken from the user's ZIP, not reconstructed as a new product implementation. The portal selector uses a min-width-safe grid/scroll rail on mobile to avoid horizontal page overflow. |
| `src/index.css` and Tailwind 4 | Inlined CSS in the one-file Vite page | Mint/emerald and azure palette retained; animations and reduced-motion rules come from the ZIP. A root overflow clip contains the ZIP's decorative glows on small screens. |
| React 19 app and component interactions | Inlined JavaScript in the one-file Vite page | Menus, portal selectors, FAQ, patient journey, back-to-top and demo form remain interactive. |
| Google-hosted Vazirmatn variable face | Local Arabic and Latin variable subsets from pinned `@fontsource-variable/vazirmatn` 5.3.0 | Preserves the 100–900 weight range, removes third-party font requests and supports the project Pages subpath. |
| Demo CTA's client-only submission state | Same form treatment, with an explicit local-only/no-submission message | Prevents a public preview from falsely saying a lead was submitted or will receive follow-up. No data is transmitted or persisted. |
| Original `theme-settings.html`, `preview.css`, `preview.js` | Retained as a separate page; six original sections and tab behavior are unchanged | Shared colors now align to mint/emerald and azure. This page is not part of the ZIP. |

## Review and provenance

The build helper extracts only the pinned owner ZIP into a temporary directory, applies the listed preview adaptations, installs its locked npm dependencies, and builds. It never writes into `themes/koorosh/` or changes the CPMS product. GitHub Pages verifies the build output against the committed preview before staging its allowlisted files.

The homepage and Settings page both retain `noindex,nofollow` and a visible preview notice. GitHub Pages and this repository remain publicly reachable; those labels do not make the preview private.

`REAL CPMS MEDIA = NOT AVAILABLE`. The ZIP contains a stylized mock interface and sample data, not verified CPMS media. Product statements inside the ZIP are reproduced because the owner selected that archive as the new full-site reference; they are not independently verified claims or evidence that the installed product implements them. Product Owner approval remains required before production-theme installation.

Responsive validation uses 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1440×900 and 1920×1080. Pages and WordPress CI run Chromium interactions and capture both pages at every matrix width; the artifact is review evidence, not automatic visual approval.

## Acceptance status

- ZIP source hash and clean integrity check: verified.
- Side-by-side screenshots of the original ZIP build and preview were reviewed at 390, 768, 1366 and 1440 widths, including full-page comparison. `VISUAL ACCEPTANCE = REVIEWED`; section order, responsive composition, mock UI, palette, typography and card language match closely. The visible preview notice, local font fallback, honest local-only demo message, and two mobile overflow fixes are the intentional differences. This is not a claim of pixel-identical rendering or production approval.
- Reproducible Vite build and automated browser/static checks are included in the PR workflow; latest local browser run passed at all seven widths.
- Real CPMS media: `NOT AVAILABLE`.
