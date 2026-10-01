#!/usr/bin/env python3
"""Structural and boundary checks for the isolated visual review preview."""
from __future__ import annotations

import colorsys
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
FORBIDDEN_FILLER = (
    "lorem ipsum", "your address", "hello@example.com", "[telegram]",
    "your phone", "example.com", "pass —", "pass:", "status: pass",
)
AUTHORIZED_EMAIL = "biatoweb@gmail.com"

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
        self.zip_links: list[str] = []
        self.references: list[str] = []
        self.scripts: list[dict[str, str | None]] = []
        self.stylesheets: list[str] = []
        self.robots = False
        self.h1_count = 0
        self.forms = 0
        self.labels: set[str] = set()
        self.controls: list[dict[str, str | None]] = []
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
        if tag == "label" and values.get("for"):
            self.labels.add(str(values["for"]))
        if tag in {"input", "textarea", "select"}:
            self.controls.append(values)
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
            if re.search(r"\.zip(?:[?#]|$)", href, re.I):
                self.zip_links.append(href)
            if href.startswith("#"):
                self.anchors.append(href[1:])
            elif not href.startswith(("mailto:", "tel:")):
                self.references.append(href)
        if tag in {"script", "img", "iframe", "source"}:
            src = values.get("src")
            if src:
                self.references.append(str(src))
            if tag == "script":
                self.scripts.append(values)
        if tag == "link" and values.get("href") and values.get("rel") in {"stylesheet", "preload"}:
            self.references.append(str(values["href"]))
            if values.get("rel") == "stylesheet":
                self.stylesheets.append(str(values["href"]))
        if tag == "meta" and values.get("name", "").lower() == "robots":
            self.robots = str(values.get("content", "")).replace(" ", "").lower() == "noindex,nofollow"
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        # SVG geometry uses XML-style empty tags inside otherwise ordinary HTML.
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
        if data.strip():
            self.visible_text.append(data.strip())


for page_name in PAGES:
    page = PREVIEW / page_name
    check(page.is_file(), f"missing preview page: {page_name}")
    if not page.is_file():
        continue
    source = page.read_text(encoding="utf-8")
    audit = MarkupAudit(page_name)
    try:
        audit.feed(source)
        audit.close()
    except Exception as exc:  # HTMLParser is intentionally the standard-library parser.
        failures.append(f"{page_name}: HTML parser error: {exc}")
    if audit.stack:
        failures.append(f"{page_name}: unclosed HTML elements: {' > '.join(audit.stack[-8:])}")

    check(audit.html_attrs.get("lang") == "fa" and audit.html_attrs.get("dir") == "rtl", f"{page_name}: Persian language and native RTL root")
    check(audit.robots, f"{page_name}: robots meta is exactly noindex,nofollow")
    check("پیش‌نمایش طراحی — نسخه نهایی سایت نیست" in source, f"{page_name}: visible design-preview / not-final notice")
    check(audit.h1_count == 1, f"{page_name}: exactly one H1")
    check(audit.forms == 0, f"{page_name}: no real form or submission endpoint")
    if page_name == "index.html":
        check(len(audit.zip_links) == 1, "index.html: exactly one offline bundle link exists in the downloadable source")
        check(source.count('class="media-reservation ') == 2, "index.html: hero and product proof reserve two large replaceable media compositions")
        media_figures = re.findall(r'<figure\b[^>]*class="media-reservation [^"]*"[^>]*>.*?</figure>', source, re.DOTALL)
        check(len(media_figures) == 2, "index.html: both reserved media figures are well-formed")
        check(all(figure.count('class="media-disclosure"') == 1 for figure in media_figures), "index.html: each reserved composition has one concise Persian disclosure")
        check(all("تصویر واقعی محصول در این جایگاه قرار می‌گیرد." in figure for figure in media_figures), "index.html: media disclosures say real product imagery is not present yet")
        check(all(not re.search(r"<(?:img|button|input|select|textarea|table|canvas|iframe)\b", figure, re.I) for figure in media_figures), "index.html: reserved compositions contain no fabricated product UI, screenshots or photography")
        check("media-stage__chrome" not in source and "media-glass-accent" not in source, "index.html: abstract compositions do not imitate browser chrome or floating product controls")
        check(source.count('class="workflow-step"') == 5, "index.html: clinic journey contains five separate review stages")
        for stage in ("نوبت", "پذیرش", "صف", "ویزیت", "پرونده"):
            check(f"<h3>{stage}</h3>" in source, f"index.html: journey contains the separate {stage} stage")
        check(source.index('id="product-proof"') < source.index('id="workflow"'), "index.html: product proof appears before the integrated workflow")
        check("کلینیک‌های چندپزشکی و مراکز درمانی" in source and "مطب مستقل یا مجموعهٔ کوچک‌تر" in source, "index.html: existing clinic-fit positioning remains bounded")
    else:
        check(len(audit.zip_links) == 0, "theme-settings.html: no offline bundle link is exposed")
        check(source.count('class="settings-panel"') == 6, "theme-settings.html: exactly six settings sections remain")
        check(source.count('role="tab"') == 6, "theme-settings.html: exactly six navigation tabs remain")
    check(not re.search(r"https?://|//fonts\.googleapis|fonts\.gstatic", source, re.I), f"{page_name}: no external URL or remote font reference")
    check(not any(term in source.lower() for term in FORBIDDEN_FILLER), f"{page_name}: no English filler or fake success status")

    for anchor in audit.anchors:
        check(anchor in audit.ids, f"{page_name}: local anchor target #{anchor} exists")
    for identifier in audit.idrefs:
        check(identifier in audit.ids, f"{page_name}: ARIA ID reference #{identifier} exists")
    for reference in audit.references:
        ref_path = reference.split("?", 1)[0].split("#", 1)[0]
        target = (PREVIEW / ref_path).resolve()
        check(target == PREVIEW.resolve() or PREVIEW.resolve() in target.parents, f"{page_name}: local reference stays inside visual-preview: {reference}")
        check(target.is_file(), f"{page_name}: local reference exists: {reference}")
    for stylesheet in audit.stylesheets:
        target = (PREVIEW / stylesheet).resolve()
        check(target.is_file(), f"{page_name}: stylesheet exists: {stylesheet}")
    check(len(audit.scripts) == 1 and audit.scripts[0].get("src") == "preview.js" and "defer" in audit.scripts[0], f"{page_name}: one deferred local script only")

    page_text = " ".join(audit.visible_text)
    check("Lorem Ipsum" not in page_text and "Your address" not in page_text, f"{page_name}: no placeholder English copy")
    emails = set(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", source))
    check(emails <= {AUTHORIZED_EMAIL}, f"{page_name}: contact addresses are restricted to the authorized public email")

    if page_name == "theme-settings.html":
        for tab in ("عمومی", "اطلاعات تماس", "فروش و درخواست دمو", "هدر و فوتر", "شبکه‌های اجتماعی", "وضعیت سایت"):
            check(tab in page_text, f"theme-settings.html: required section exists: {tab}")
        for status in ("فعال", "غیرفعال", "نیازمند بررسی", "تأیید نشده"):
            check(status in page_text, f"theme-settings.html: honest status vocabulary exists: {status}")
        check("پذیرش Elementor Pro روی میزبان" in page_text, "theme-settings.html: host acceptance is named and not claimed")
        check("کنسول جست‌وجوی گوگل" in page_text, "theme-settings.html: Search Console is named in Persian")
        check("رسانهٔ واقعی محصول" in page_text, "theme-settings.html: product-media status is explicit")
        check("ذخیره‌سازی در این نمونه غیرفعال است" in page_text, "theme-settings.html: non-persistence is visible")

css_path = PREVIEW / "preview.css"
js_path = PREVIEW / "preview.js"
css = css_path.read_text(encoding="utf-8") if css_path.exists() else ""
js = js_path.read_text(encoding="utf-8") if js_path.exists() else ""
check(bool(css), "preview.css exists and is not empty")
# Raw source-transfer budget for the Pages site; the downloadable ZIP is separate.
preview_payload_files = [css_path, js_path, *(PREVIEW / name for name in PAGES)]
preview_payload_files += [PREVIEW / "assets" / "fonts" / name for name in ("Vazirmatn-Regular.woff2", "Vazirmatn-Bold.woff2", "OFL.txt")]
preview_payload_size = sum(path.stat().st_size for path in preview_payload_files if path.is_file())
check(css_path.stat().st_size <= 110_000, f"preview CSS stays within the 110 KB raw-size budget ({css_path.stat().st_size:,} bytes)")
check(preview_payload_size <= 275_000, f"deployed preview assets stay within the 275 KB raw-size budget ({preview_payload_size:,} bytes)")
check("green" not in css.lower() and "teal" not in css.lower(), "preview palette contains no green/teal styling tokens or terminology")

def is_rejected_green_hue(rgb: tuple[int, int, int]) -> bool:
    hue, _lightness, saturation = colorsys.rgb_to_hls(*(value / 255 for value in rgb))
    degrees = hue * 360
    return 82 <= degrees <= 165 and saturation >= 0.045

rejected_colors: list[str] = []
for match in re.finditer(r"#[0-9A-Fa-f]{6}\b", css):
    swatch = match.group(0)
    rgb = tuple(int(swatch[index:index + 2], 16) for index in (1, 3, 5))
    if is_rejected_green_hue(rgb):
        rejected_colors.append(swatch)
for match in re.finditer(r"\brgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)", css, re.I):
    rgb = tuple(round(float(match.group(index))) for index in (1, 2, 3))
    if is_rejected_green_hue(rgb):
        rejected_colors.append(match.group(0))
check(not rejected_colors, f"preview palette has no green-family hue colors: {rejected_colors[:5]}")
check(bool(js), "preview.js exists and is not empty")
check("CPMS visual-review Design System v3" in css, "preview documents the v3 token system and its non-production scope")
for token in ("--color-canvas", "--color-surface", "--color-ink", "--color-copy", "--color-muted", "--color-primary", "--color-cobalt", "--color-sky", "--color-aqua", "--color-aqua-soft", "--color-glass", "--color-success", "--color-warning", "--color-info"):
    check(token in css, f"preview design system defines semantic token {token}")
for token in ("--space-1", "--space-11", "--radius-sm", "--radius-xl", "--shadow-soft", "--shadow-raised", "--shadow-float"):
    check(token in css, f"preview design system defines scale token {token}")
readme = (PREVIEW / "README.md").read_text(encoding="utf-8") if (PREVIEW / "README.md").is_file() else ""
check("REAL CPMS MEDIA = NOT AVAILABLE" in readme, "preview records the verified real-media gate outcome")
check("prefers-reduced-motion: reduce" in css and "prefers-reduced-motion: reduce" in js, "reduced-motion CSS and JavaScript behavior exist")
check("IntersectionObserver" in js, "scroll reveal uses a small native IntersectionObserver helper")
check("aria-selected" in js and "role=\"tabpanel\"" in (PREVIEW / "theme-settings.html").read_text(encoding="utf-8"), "settings navigation has an accessible tab implementation")
check("Escape" in js and "mobileNavigation" in js, "interactive mobile menu has close behavior")
check(not re.search(r"https?://|//fonts\.googleapis|fonts\.gstatic|fetch\s*\(|XMLHttpRequest|sendBeacon", css + js, re.I), "CSS/JavaScript contain no remote assets, requests or analytics")
check(not re.search(r"animation(?:-iteration-count)?\s*:[^;}]*infinite", css, re.I), "preview animations are finite and do not run continuously")
for css_url in re.findall(r"url\(\s*['\"]?([^)'\"]+)", css, re.I):
    check(not css_url.lower().startswith(("http:", "https:", "//", "data:")), f"CSS asset is local: {css_url}")
    css_target = (PREVIEW / css_url).resolve()
    check(css_target.is_file(), f"CSS asset exists: {css_url}")

for asset in ("Vazirmatn-Regular.woff2", "Vazirmatn-Bold.woff2", "OFL.txt"):
    preview_asset = PREVIEW / "assets" / "fonts" / asset
    source_asset = ROOT / "themes" / "koorosh" / "fonts" / asset
    check(preview_asset.is_file(), f"local preview font/license exists: {asset}")
    if preview_asset.is_file() and source_asset.is_file():
        check(hashlib.sha256(preview_asset.read_bytes()).digest() == hashlib.sha256(source_asset.read_bytes()).digest(), f"preview copy is byte-identical to the repository source: {asset}")

bundle = PREVIEW / "koorosh-design-preview.zip"
check(bundle.is_file(), "downloadable standalone HTML preview bundle exists")
if bundle.is_file():
    expected_files = sorted(
        path.relative_to(PREVIEW).as_posix()
        for path in PREVIEW.rglob("*")
        if path.is_file() and path != bundle
    )
    try:
        with zipfile.ZipFile(bundle) as archive:
            members = sorted(name.removeprefix("koorosh-visual-preview/") for name in archive.namelist() if not name.endswith("/"))
            check(members == expected_files, "download bundle contains exactly the current preview files")
            for rel in expected_files:
                archived = archive.read(f"koorosh-visual-preview/{rel}")
                check(archived == (PREVIEW / rel).read_bytes(), f"download bundle matches current file: {rel}")
    except (OSError, zipfile.BadZipFile, KeyError) as exc:
        failures.append(f"download bundle is readable and complete: {exc}")

if failures:
    for failure in failures:
        print(f"FAIL: {failure}", file=sys.stderr)
    print(f"FAIL: visual preview validation ({checks} checks, {len(failures)} failures)", file=sys.stderr)
    sys.exit(1)

print(f"PASS: isolated interactive visual preview ({checks} checks; HTML, local assets, honesty, noindex and downloadable bundle)")
