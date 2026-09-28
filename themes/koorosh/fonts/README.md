# Vazirmatn web fonts (subset of the release — 2 weights)

Self-hosted Persian web font for the CPMS marketing website design system.

| Field | Value |
|---|---|
| Family | Vazirmatn |
| Upstream | https://github.com/rastikerdar/vazirmatn |
| Release tag | `v33.003` (published 2022-06-22; latest upstream release at retrieval) |
| License | SIL Open Font License 1.1 — see `OFL.txt` (copyright 2015 The Vazirmatn Project Authors) |
| Files in this directory | `Vazirmatn-Regular.woff2` (weight 400), `Vazirmatn-Bold.woff2` (weight 700) |
| Format | WOFF2 only (all modern targets); no TTF/EOT/SVG shipped |

## Integrity (retrieved 2026-09-28 UTC)

Both files are byte-identical to the upstream tag `v33.003` (verified by matching
git blob SHAs between the `master` tree and the `v33.003` tag tree via the GitHub API):

| File | Bytes | Git blob SHA (upstream) | SHA-256 |
|---|---|---|---|
| `Vazirmatn-Regular.woff2` | 50,684 | `c9824c872b3b4f2eb13a102748f8ef1a6ef97da0` | `e382101336c6eb32cfb31381c027d02d2e0354bad08f6a395d4088beb3db3d91` |
| `Vazirmatn-Bold.woff2` | 51,020 | `65b427f86eba2cfa45900de247bc7cf3294cd1e5` | `836fae7d42d83faa249bc00e0099592be98a1fa260d22d82f269b6091e585627` |
| `OFL.txt` | 4,391 | `be66b3824e9772e75141e631695c5256f105fb57` | `17e355067c8284f47743a1ee3b1ef7ff684ff0601eda357f9353b10b3016ab31` |

Checksums are also recorded in `reconstruction/manifest.json` (`artifacts`) and
enforced by `tests/static/validate-tokens.mjs`.

## Loading

The Koorosh theme serves these files via `foundation.css` (`@font-face`, `font-display: swap`).
The theme registers `Vazirmatn` in the Elementor font picker; Elementor Global Fonts
can select it without uploading another copy through Pro. No real host or kit has
been verified. The fallback stack is `Tahoma, "Segoe UI", system-ui, sans-serif`.

## License obligations (OFL 1.1)

- The license text (`OFL.txt`) must accompany any redistribution — it is committed here.
- `OFL.txt` is kept **byte-identical to upstream** (its SHA-256 is enforced by test);
  `.gitattributes` disables whitespace checks for this path so the vendored text is
  never "fixed".
- The fonts may not be sold by themselves; bundling with the website is permitted.
- Reserved Font Name: none declared for these files beyond the upstream OFL notice;
  do not rename the family when redistributing the unmodified files.
