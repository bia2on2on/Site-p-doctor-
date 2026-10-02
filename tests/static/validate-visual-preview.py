#!/usr/bin/env python3
"""Structural, provenance, payload, and safety checks for the ZIP-derived preview."""
from __future__ import annotations

import gzip
import hashlib
import re
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PREVIEW = ROOT / "visual-preview"
PAGES = ("index.html", "theme-settings.html")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
AUTHORIZED_EMAIL = "biatoweb@gmail.com"
SOURCE_SHA256 = "bbc614c937375eaf903166b824adfa77b55676444917544bfcfdc5cab74d5613"
PREVIEW_NOTICE = "پیش‌نمایش طراحی — نسخه نهایی سایت نیست"

failures: list[str] = []
checks = 0


def check(condition: bool, message: str) -> None:
    global checks
    checks += 1
    if not condition:
        failures.append(message)


class MarkupAudit(HTMLParser):
    def __init__(self, filename: str) -> None:
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.stack: list[str] = []
        self.ids: set[str] = set()
        self.anchors: list[str] = []
        self.idrefs: list[str] = []
        self.links: list[str] = []
        self.resources: list[str] = []
        self.scripts: list[dict[str, str | None]] = []
        self.stylesheets: list[str] = []
        self.robots = False
        self.h1_count = 0
        self.forms = 0
        self.visible_text: list[str] = []
        self.html_attrs: dict[str, str | None] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if len(values) != len(attrs):
            failures.append(f"{self.filename}: duplicate attribute on <{tag}>")
        if tag == "html":
            self.html_attrs = values
        if tag == "h1":
            self.h1_count += 1
        if tag == "form":
            self.forms += 1
        if values.get("id"):
            identifier = str(values["id"])
            if identifier in self.ids:
                failures.append(f"{self.filename}: duplicate id #{identifier}")
            self.ids.add(identifier)
        for attribute in ("aria-labelledby", "aria-describedby", "aria-controls"):
            if values.get(attribute):
                self.idrefs.extend(str(values[attribute]).split())
        if tag == "a" and values.get("href"):
            href = str(values["href"])
            self.links.append(href)
            if href.startswith("#"):
                self.anchors.append(href[1:])
        if tag in {"script", "img", "iframe", "source"}:
            src = values.get("src")
            if src:
                self.resources.append(str(src))
            if tag == "script":
                self.scripts.append(values)
        if tag == "link" and values.get("href"):
            href = str(values["href"])
            rel = str(values.get("rel", "")).lower().split()
            if "stylesheet" in rel:
                self.stylesheets.append(href)
            if any(item in rel for item in ("stylesheet", "preload", "modulepreload", "icon")):
                self.resources.append(href)
        if tag == "meta" and str(values.get("name", "")).lower() == "robots":
            self.robots = str(values.get("content", "")).replace(" ", "").lower() == "noindex,nofollow"
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1] == tag:
            self.stack.pop()

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID:
            failures.append(f"{self.filename}: void element </{tag}> must not have a closing tag")
            return
        if not self.stack:
            failures.append(f"{self.filename}: unexpected closing tag </{tag}>")
            return
        if self.stack[-1] != tag:
            failures.append(f"{self.filename}: closing </{tag}> does not match <{self.stack[-1]}>")
            return
        self.stack.pop()

    def handle_data(self, data: str) -> None:
        if self.stack and self.stack[-1] in {"script", "style"}:
            return
        if data.strip():
            self.visible_text.append(data.strip())


page_audits: dict[str, MarkupAudit] = {}
for page_name in PAGES:
    page = PREVIEW / page_name
    check(page.is_file(), f"missing preview page: {page_name}")
    if not page.is_file():
        continue
    source = page.read_text(encoding="utf-8")
    audit = MarkupAudit(page_name)
    page_audits[page_name] = audit
    try:
        audit.feed(source)
        audit.close()
    except Exception as exc:
        failures.append(f"{page_name}: HTML parser error: {exc}")
    if audit.stack:
        failures.append(f"{page_name}: unclosed HTML elements: {' > '.join(audit.stack[-8:])}")

    check(audit.html_attrs.get("lang") == "fa" and audit.html_attrs.get("dir") == "rtl", f"{page_name}: Persian language and native RTL root")
    check(audit.robots, f"{page_name}: robots meta is exactly noindex,nofollow")
    check(PREVIEW_NOTICE in source, f"{page_name}: preview notice is present in the page source")
    check(audit.h1_count == 1, f"{page_name}: exactly one H1 in static markup / no-JavaScript fallback")
    check(audit.forms == 0, f"{page_name}: no server-backed HTML form exists in the initial document")
    check(not any(re.match(r"^(?:https?:)?//", value, re.I) for value in audit.resources), f"{page_name}: no external stylesheet, font, script, image, or iframe request")
    check(not any(value.startswith("/") for value in audit.resources), f"{page_name}: no root-relative resource can escape the GitHub Pages project base")

    for anchor in audit.anchors:
        check(anchor in audit.ids, f"{page_name}: local anchor target #{anchor} exists")
    for identifier in audit.idrefs:
        check(identifier in audit.ids, f"{page_name}: ARIA ID reference #{identifier} exists")
    for reference in audit.resources:
        target = (PREVIEW / reference.split("?", 1)[0].split("#", 1)[0]).resolve()
        check(target == PREVIEW.resolve() or PREVIEW.resolve() in target.parents, f"{page_name}: local asset stays within visual-preview: {reference}")
        check(target.is_file(), f"{page_name}: local resource exists: {reference}")
    for stylesheet in audit.stylesheets:
        check((PREVIEW / stylesheet).is_file(), f"{page_name}: stylesheet exists: {stylesheet}")

    source_emails = set(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", source))
    check(source_emails <= {AUTHORIZED_EMAIL}, f"{page_name}: no unauthorized contact address")

    if page_name == "index.html":
        check('<div id="root"></div>' in source, "homepage: React root is present")
        check(len(audit.scripts) == 1 and audit.scripts[0].get("type") == "module" and not audit.scripts[0].get("src"), "homepage: app is a single inline Vite module, not an external script")
        check("<noscript>" in source and "جاوااسکریپت را فعال کنید" in source, "homepage: clear fallback is present when JavaScript is disabled")
        for section_id in ("top", "features", "portals", "workflow", "scenarios", "backups", "architecture", "compare", "story", "faq", "demo"):
            check(f'id:"{section_id}"' in source, f"homepage: ZIP-derived section {section_id} is included in the compiled app")
        check("IntersectionObserver" in source and "prefers-reduced-motion: reduce" in source, "homepage: reveal behavior and reduced-motion support are included")
        check("fonts.googleapis.com" not in source and "fonts.gstatic.com" not in source, "homepage: Google Fonts were replaced by local repository fonts")
        check("پیش‌نمایش فرم" in source and "درخواست واقعی ارسال یا ذخیره نشده است" in source, "homepage: demo confirmation does not claim a real submission")
        check("اطلاعات واردشده ارسال یا ذخیره نمی‌شوند" in source, "homepage: demo form discloses local-only handling")
        check("درخواست شما ثبت شد" not in source and "همکاران ما در اولین فرصت کاری" not in source, "homepage: no fictitious successful delivery or follow-up promise")
        check(not re.search(r"\b(?:XMLHttpRequest|sendBeacon)\b|\bfetch\s*\(", source, re.I), "homepage: compiled app has no network submission or analytics API")
        check(not re.search(r"(?:href|src)\s*=\s*[\"']/(?!/)", source, re.I), "homepage: no root-relative HTML resource path")
        check("koorosh-design-preview.zip" not in source.lower(), "homepage: no undeployed offline ZIP download link")
    else:
        check(len(audit.scripts) == 1 and audit.scripts[0].get("src") == "preview.js" and "defer" in audit.scripts[0], "Theme Settings: one deferred local interaction script")
        check(len(audit.stylesheets) == 1 and audit.stylesheets[0] == "preview.css", "Theme Settings: one local preview stylesheet")
        check(not re.search(r"\.zip(?:[?#\"']|$)", source, re.I), "Theme Settings: no downloadable ZIP link")
        check(source.count('class="settings-panel"') == 6, "Theme Settings: exactly six sections remain")
        check(source.count('role="tab"') == 6, "Theme Settings: exactly six tabs remain")
        text = " ".join(audit.visible_text)
        for tab in ("عمومی", "اطلاعات تماس", "فروش و درخواست دمو", "هدر و فوتر", "شبکه‌های اجتماعی", "وضعیت سایت"):
            check(tab in text, f"Theme Settings: required section exists: {tab}")
        for status in ("فعال", "غیرفعال", "نیازمند بررسی", "تأیید نشده"):
            check(status in text, f"Theme Settings: honest status vocabulary exists: {status}")
        for disclosure in ("پذیرش Elementor Pro روی میزبان", "کنسول جست‌وجوی گوگل", "رسانهٔ واقعی محصول", "ذخیره‌سازی در این نمونه غیرفعال است"):
            check(disclosure in text, f"Theme Settings: preserved status/disclosure: {disclosure}")

# Runtime payload and design-token checks.
css_path = PREVIEW / "preview.css"
js_path = PREVIEW / "preview.js"
css = css_path.read_text(encoding="utf-8") if css_path.is_file() else ""
js = js_path.read_text(encoding="utf-8") if js_path.is_file() else ""
index_path = PREVIEW / "index.html"
index = index_path.read_text(encoding="utf-8") if index_path.is_file() else ""
settings_path = PREVIEW / "theme-settings.html"
settings = settings_path.read_text(encoding="utf-8") if settings_path.is_file() else ""
check(bool(css) and bool(js), "Theme Settings stylesheet and interaction script exist")
check("--color-primary: #10B981" in css and "--color-primary-hover: #059669" in css, "Settings semantic primary tokens follow the ZIP mint/emerald palette")
check("#1F7DF0" in css and "#ECFDF5" in css, "Settings accent palette retains the ZIP's mint-to-azure visual language")
check("prefers-reduced-motion: reduce" in css and "prefers-reduced-motion: reduce" in js, "Settings reduced-motion CSS and JavaScript behavior exist")
check("IntersectionObserver" in js, "Settings reveal uses the native IntersectionObserver helper")
check('aria-selected' in js and 'role="tabpanel"' in settings, "Settings tabs keep accessible selection and panels")
check("Escape" in js and "mobileNavigation" in js, "Settings script retains its existing dismissal behavior")
check(not re.search(r"https?://|fonts\.googleapis|fonts\.gstatic|XMLHttpRequest|sendBeacon|\bfetch\s*\(", css + js, re.I), "Settings CSS/JavaScript have no remote asset, submission, or analytics request")
check(not re.search(r"animation(?:-iteration-count)?\s*:[^;}]*infinite", css, re.I), "retained Settings stylesheet has no infinite animation")

css_urls = re.findall(r"url\(\s*['\"]?([^)'\"]+)", css, re.I)
for css_url in css_urls:
    check(not css_url.lower().startswith(("http:", "https:", "//")), f"CSS asset is local: {css_url}")
    if not css_url.lower().startswith("data:"):
        check((PREVIEW / css_url).is_file(), f"CSS asset exists: {css_url}")

font_names = ("Vazirmatn-Arabic.woff2", "Vazirmatn-Latin.woff2", "OFL.txt")
font_paths = [PREVIEW / "assets" / "fonts" / name for name in font_names]
font_digests = {
    "Vazirmatn-Arabic.woff2": "84a382e46c30fb4f73d0e3800c16d0af15888e2731e57fa5f93e2c29a2c6a957",
    "Vazirmatn-Latin.woff2": "d29c041cd4294af893cf3c01dfab6d47202c667ab55d702f68782599918c651d",
}
for preview_font in font_paths:
    check(preview_font.is_file(), f"local preview font/license exists: {preview_font.name}")
    if preview_font.is_file() and preview_font.name in font_digests:
        check(hashlib.sha256(preview_font.read_bytes()).hexdigest() == font_digests[preview_font.name], f"variable font matches pinned Vazirmatn source: {preview_font.name}")
license_text = (PREVIEW / "assets" / "fonts" / "OFL.txt").read_text(encoding="utf-8") if font_paths[-1].is_file() else ""
check("SIL Open Font License, Version 1.1" in license_text, "local variable font license is present")
check("font-weight: 100 900" in css and "woff2-variations" in css, "Settings font faces preserve the ZIP's full Vazirmatn variable-weight range")

home_bytes = index_path.stat().st_size if index_path.is_file() else 0
home_gzip_bytes = len(gzip.compress(index_path.read_bytes(), compresslevel=9, mtime=0)) if index_path.is_file() else 0
font_bytes = sum(path.stat().st_size for path in font_paths if path.is_file())
# The exact React/Vite site is intentionally larger than the previous hand-authored
# HTML. Track both gzip transfer size and the complete static Pages inventory.
check(home_bytes <= 330_000, f"ZIP-derived single-file homepage remains under 330 KB raw ({home_bytes:,} bytes)")
check(home_gzip_bytes <= 100_000, f"ZIP-derived homepage remains under 100 KB gzip ({home_gzip_bytes:,} bytes)")
check(font_bytes <= 110_000, f"local font files remain under 110 KB ({font_bytes:,} bytes)")
check(css_path.stat().st_size <= 115_000, f"Theme Settings CSS remains under 115 KB raw ({css_path.stat().st_size:,} bytes)")
runtime_files = [index_path, settings_path, css_path, js_path, *font_paths[:2]]
runtime_bytes = sum(path.stat().st_size for path in runtime_files if path.is_file())
check(runtime_bytes <= 575_000, f"all deployed preview runtime files remain under 575 KB raw ({runtime_bytes:,} bytes)")

readme_path = PREVIEW / "README.md"
readme = readme_path.read_text(encoding="utf-8") if readme_path.is_file() else ""
check("REAL CPMS MEDIA = NOT AVAILABLE" in readme, "preview records that real CPMS media is unavailable")
check(SOURCE_SHA256 in readme and "modern-glassmorphic-plugin-website (2).zip" in readme, "README identifies the owner ZIP and its exact SHA-256")
check("scripts/build-zip-preview.py --check" in readme, "README documents the reproducible ZIP-derived build check")

build_script = ROOT / "scripts" / "build-zip-preview.py"
check(build_script.is_file() and SOURCE_SHA256 in build_script.read_text(encoding="utf-8"), "reproducible build script is present and pins the reviewed ZIP")

bundle = PREVIEW / "koorosh-design-preview.zip"
check(bundle.is_file(), "standalone downloadable preview bundle exists")
if bundle.is_file():
    expected_files = sorted(path.relative_to(PREVIEW).as_posix() for path in PREVIEW.rglob("*") if path.is_file() and path != bundle)
    try:
        with zipfile.ZipFile(bundle) as archive:
            members = sorted(name.removeprefix("koorosh-visual-preview/") for name in archive.namelist() if not name.endswith("/"))
            check(members == expected_files, "offline bundle contains exactly the current preview files")
            check(archive.testzip() is None, "offline bundle passes the ZIP CRC/integrity check")
            for rel in expected_files:
                check(archive.read(f"koorosh-visual-preview/{rel}") == (PREVIEW / rel).read_bytes(), f"offline bundle matches current file: {rel}")
    except (OSError, zipfile.BadZipFile, KeyError) as exc:
        failures.append(f"offline bundle is readable and complete: {exc}")

if failures:
    for failure in failures:
        print(f"FAIL: {failure}", file=sys.stderr)
    print(f"FAIL: ZIP-derived visual preview validation ({checks} checks, {len(failures)} failures)", file=sys.stderr)
    sys.exit(1)

print(
    "PASS: ZIP-derived isolated preview "
    f"({checks} checks; source/robots/disclosures/local assets/settings tabs/bundle; "
    f"homepage {home_bytes:,} B, {home_gzip_bytes:,} B gzip; runtime {runtime_bytes:,} B raw)"
)
