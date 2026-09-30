# Test-host transfer — Koorosh theme package

**TEST-HOST TRANSFER PACKAGE (TEST BUILD).** Not a production release, not publication authorization, not Elementor Pro / LiteSpeed / real-host acceptance. Use it **only on the authorized, non-public, non-indexed test host.**

## What GitHub can and cannot hand over today

| Item | Status |
|---|---|
| **Koorosh theme (`koorosh`)** | **Transferable.** CI builds an installable ZIP from the exact commit. Install it with the steps below. |
| **Elementor page content** | **Not transferable from GitHub yet.** The pages are rebuilt in CI from authoring recipes (`reconstruction/*/recipe.mjs`) driven by an automated script against a throw-away local WordPress. The recipes are **not** an Elementor kit, **not** importable through the Elementor UI, and their runners refuse to touch any non-disposable site. No Elementor Website Template ZIP exists in Git. The real-host Elementor/Pro kit export/import pilot is **NOT RUN** (`clean_import_pilot`, `authorized_pro_host_acceptance` in `reconstruction/manifest.json`). |
| Elementor Free 4.3.2 / Elementor Pro 4.3.0 | **Host-owned.** Never in the package. Not installed from GitHub. |
| LiteSpeed / LiteSpeed Cache | **Host-owned.** Not in the package. If it joins the stack later, install it separately from an official source. |
| Lead delivery, SMTP, credentials | **Environment-owned.** The package contains code only, no secrets, and delivery is OFF by default. |

Theme package acceptance ≠ Elementor Pro acceptance ≠ LiteSpeed acceptance.

## Steps for the owner (test host only)

1. **Back up the test host** (files + database). Activating Koorosh changes the active theme, so pages built under Hello Elementor may look different.
2. **Do not touch the production/public site.** Work only on the authorized test host.
3. **Download the installable theme ZIP directly (mobile & desktop friendly).** Open GitHub → repository → **Releases** → pre-release **`koorosh-test-v1.1.0`** (**Koorosh 1.1.0 — Test Host Transfer Build**, marked `Pre-release`) → under **Assets**, tap/click **`koorosh-1.1.0-test-build-<sha12>.zip`** (alongside `koorosh-transfer-manifest.json` and `SHA256SUMS`). The asset is the direct WordPress-installable theme ZIP — **do not extract it**.
4. **Alternative desktop path (Actions artifact).** If you download `koorosh-test-host-transfer-<commit SHA>` from **Actions** instead of **Releases**, GitHub wraps that workflow artifact in an outer ZIP; unzip it once first and upload **only the inner `koorosh-…zip`** to WordPress, never the outer wrapper.
5. **Verify the checksum (optional, recommended).** Compare the SHA-256 of the theme ZIP with `zip_sha256` in the manifest (Windows: `certutil -hashfile <file> SHA256`; Linux/macOS: `sha256sum -c SHA256SUMS`). Confirm `source_commit_sha` is the commit you were given, and that the manifest says `elementor_pro_included`, `production_release` and `publication_authorized` are all `false`.
6. **WordPress Admin → Appearance → Themes → Add New → Upload Theme** → choose the inner ZIP → **Install Now**. If a `koorosh` theme already exists, WordPress offers to replace it; that is expected for a re-install.
7. **Activate** Koorosh (کوروش) on the test host.
8. **Confirm there is no PHP fatal**: open the site front page and one Admin screen. If a critical error shows, copy it **exactly as shown**, switch back to the previous theme and stop.
9. **Open تنظیمات کوروش** (top-level Admin menu entry) and confirm it loads.
10. **Keep lead delivery OFF.** Leave the site-level lead switch off. Do **not** add `CPMS_LEAD_DELIVERY_ENABLED` to `wp-config.php`. Do not send real email, and use no real customer or patient data.
11. **Keep the host non-indexed.** Leave Settings → Reading → "Discourage search engines" ticked. Do not change publication state.
12. **Confirm the existing plugins** are Elementor 4.3.2 and Elementor Pro 4.3.0, installed and authorized by you. **Do not install Elementor Pro from GitHub** (it is never there), and do not paste any license, password or token into chat.

## Evidence to return (small, no patient/customer data)

1. Screenshot: Appearance → Themes showing **Koorosh (کوروش) active**, with its version.
2. Screenshot: **تنظیمات کوروش** screen.
3. Elementor → System Info (or its “Copy” text) taken **after** Koorosh is active. Remove anything secret before sending.
4. The SHA-256 you computed for the ZIP (if you did step 5).
5. Any error or fatal exactly as shown (text or screenshot), or "none".

## Next step after this (only when requested, separate slice)

Elementor content moves by an Elementor **Website Template kit** exported from a Pro-capable Elementor site (Elementor → Tools → Website Templates → Export, ZIP file), inspected before any import and then tried on a clean test host. No such kit exists yet. Keep any export private and out of Git until it has been inspected (`reconstruction/incoming/` is git-ignored for this). Do not start this unless asked.

## Maintainers: how the package is produced

- `scripts/package-koorosh-theme.py` builds `dist/transfer/` (git-ignored; no ZIP is committed): theme ZIP (root `koorosh/`), `koorosh-transfer-manifest.json`, `SHA256SUMS`. It packages only `.php`, `.css`, `.js`, `.woff2` files plus `fonts/OFL.txt`. `fonts/README.md` is deliberately left out and any new unclassified file under `themes/koorosh` fails the build.
- The ZIP is byte-for-byte deterministic for a given source tree (sorted members, fixed 1980 timestamps and modes, stored, no build-tool dependence). The build timestamp appears only in the manifest. The version is read from `style.css` (currently the existing `Version` header; no release automation exists).
- CI job `koorosh-transfer-package` (`.github/workflows/wordpress-elementor-smoke.yml`) checks out the exact head SHA, runs the package tests, builds twice and compares, validates (`tests/package/validate_package.py`), then installs the ZIP into a **clean** WordPress 7.1.2 + Elementor 4.3.2 (`tests/package/.wp-env.json`, no theme mapped from source) via WP-CLI `wp theme install` and checks activation, byte-identical installed files, frontend 200, Koorosh settings page, lead delivery OFF and noindex header (`tests/package/install-check.sh`). The 14-day workflow artifact is uploaded only if all of that passes, and on `main` the job also publishes/updates the GitHub **Pre-release** `koorosh-test-v<version>` (**Koorosh `<version>` — Test Host Transfer Build**, `--prerelease`, never a production release) attaching the installable `koorosh-<version>-test-build-<sha12>.zip`, `koorosh-transfer-manifest.json` and `SHA256SUMS` directly as clickable release assets.
- Limits: the install proof uses WordPress's installer through WP-CLI, not the browser upload form; the secret/forbidden-file checks are practical pattern checks, not exhaustive detection; everything runs on Apache in CI, not on the owner's LiteSpeed host.
