#!/usr/bin/env python3
"""Rebuild the isolated preview homepage from the owner-provided Vite ZIP.

The archive is extracted to a temporary directory, then receives only the
preview-specific safety adaptations documented in visual-preview/README.md:
local Vazirmatn fonts, a visible preview notice, noindex/nofollow, a relative
Pages base path, a non-submitting demo-form disclosure, and mobile overflow
fixes for decorative glows and the portal-selector rail. The product/theme
source is never changed. Use --write locally or --check in CI.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_REF = "origin/main:modern-glassmorphic-plugin-website (2).zip"
OUTPUT = ROOT / "visual-preview" / "index.html"
EXPECTED_ARCHIVE_SHA256 = "bbc614c937375eaf903166b824adfa77b55676444917544bfcfdc5cab74d5613"
FONT_NAMES = ("Vazirmatn-Arabic.woff2", "Vazirmatn-Latin.woff2")
FONT_SHA256 = {
    "Vazirmatn-Arabic.woff2": "84a382e46c30fb4f73d0e3800c16d0af15888e2731e57fa5f93e2c29a2c6a957",
    "Vazirmatn-Latin.woff2": "d29c041cd4294af893cf3c01dfab6d47202c667ab55d702f68782599918c651d",
}


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"expected one {label} anchor, found {count}")
    return text.replace(old, new, 1)


def patch_project(source: Path) -> None:
    index = source / "index.html"
    text = index.read_text(encoding="utf-8")
    text = replace_once(
        text,
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
        '    <meta name="robots" content="noindex,nofollow" />\n',
        "viewport metadata",
    )
    description = '    <meta name="description" content="CPMS — افزونه حرفه‌ای وردپرس برای مدیریت کامل مطب و کلینیک: نوبت‌دهی آنلاین، صف و پذیرش، پرونده بالینی، نسخه‌نویسی، مالی و گزارش‌ها." />\n'
    text = replace_once(
        text,
        description,
        description
        + '    <link rel="preload" href="assets/fonts/Vazirmatn-Arabic.woff2" as="font" type="font/woff2" crossorigin />\n'
        '    <link rel="preload" href="assets/fonts/Vazirmatn-Latin.woff2" as="font" type="font/woff2" crossorigin />\n',
        "local font preloads",
    )
    remote_font_lines = (
        '    <link rel="preconnect" href="https://fonts.googleapis.com" />\n'
        '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
        '    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet" />\n'
    )
    text = replace_once(text, remote_font_lines, "", "remote Google Fonts references")
    text = replace_once(
        text,
        '    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n',
        '    <div id="root"></div>\n'
        '    <noscript><div dir="rtl" lang="fa"><p>پیش‌نمایش طراحی — نسخه نهایی سایت نیست</p><h1>CPMS | سیستم مدیریت مطب و کلینیک</h1><p>برای نمایش پیش‌نمایش، جاوااسکریپت را فعال کنید.</p></div></noscript>\n'
        '    <script type="module" src="/src/main.tsx"></script>\n',
        "no-JavaScript notice",
    )
    index.write_text(text, encoding="utf-8")

    css = source / "src" / "index.css"
    text = css.read_text(encoding="utf-8")
    text = replace_once(
        text,
        '@import "tailwindcss";\n',
        '@import "tailwindcss";\n\n'
        '@font-face { font-family: "Vazirmatn"; src: url("/assets/fonts/Vazirmatn-Arabic.woff2") format("woff2-variations"); font-style: normal; font-weight: 100 900; font-display: swap; unicode-range: U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC,U+102E0-102FB,U+10E60-10E7E,U+10EC2-10EC4,U+10EFC-10EFF,U+1EE00-1EE03,U+1EE05-1EE1F,U+1EE21-1EE22,U+1EE24,U+1EE27,U+1EE29-1EE32,U+1EE34-1EE37,U+1EE39,U+1EE3B,U+1EE42,U+1EE47,U+1EE49,U+1EE4B,U+1EE4D-1EE4F,U+1EE51-1EE52,U+1EE54,U+1EE57,U+1EE59,U+1EE5B,U+1EE5D,U+1EE5F,U+1EE61-1EE62,U+1EE64,U+1EE67-1EE6A,U+1EE6C-1EE72,U+1EE74-1EE77,U+1EE79-1EE7C,U+1EE7E,U+1EE80-1EE89,U+1EE8B-1EE9B,U+1EEA1-1EEA3,U+1EEA5-1EEA9,U+1EEAB-1EEBB,U+1EEF0-1EEF1; }\n'
        '@font-face { font-family: "Vazirmatn"; src: url("/assets/fonts/Vazirmatn-Latin.woff2") format("woff2-variations"); font-style: normal; font-weight: 100 900; font-display: swap; unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }\n',
        "local font faces",
    )
    text = replace_once(
        text,
        "html {\n",
        "html {\n  overflow-x: clip;\n",
        "root-level clip for oversized decorative glows",
    )
    css.write_text(text, encoding="utf-8")

    nav = source / "src" / "components" / "Nav.tsx"
    text = nav.read_text(encoding="utf-8")
    text = replace_once(
        text,
        '    <header className="fixed inset-x-0 top-0 z-50">\n      <div\n',
        '    <header className="fixed inset-x-0 top-0 z-50">\n'
        '      <div id="preview-notice" className="mx-auto mt-1 max-w-7xl px-4 text-center" role="note">\n'
        '        <span className="inline-flex rounded-full border border-emerald-200/70 bg-white/80 px-3 py-1 text-[10px] font-semibold text-gray-600 shadow-sm backdrop-blur">\n'
        '          پیش‌نمایش طراحی — نسخه نهایی سایت نیست\n'
        '        </span>\n'
        '      </div>\n'
        '      <div\n',
        "visible preview notice",
    )
    nav.write_text(text, encoding="utf-8")

    portals = source / "src" / "components" / "Portals.tsx"
    text = portals.read_text(encoding="utf-8")
    text = replace_once(
        text,
        'className="reveal mt-8 grid gap-6 lg:grid-cols-[320px_1fr]"',
        'className="reveal mt-8 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"',
        "mobile-safe portal showcase grid",
    )
    text = replace_once(
        text,
        'className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"',
        'className="flex min-w-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"',
        "mobile-safe portal selector rail",
    )
    portals.write_text(text, encoding="utf-8")

    demo = source / "src" / "components" / "DemoCTA.tsx"
    text = demo.read_text(encoding="utf-8")
    text = replace_once(
        text,
        '                <h3 className="mt-5 text-xl font-black text-gray-900">درخواست شما ثبت شد</h3>\n'
        '                <p className="mt-2 text-[13px] leading-7 text-gray-500">\n'
        '                  همکاران ما در اولین فرصت کاری با شما تماس می‌گیرند تا زمان دمو را هماهنگ کنند.\n'
        '                </p>',
        '                <h3 className="mt-5 text-xl font-black text-gray-900">پیش‌نمایش فرم</h3>\n'
        '                <p className="mt-2 text-[13px] leading-7 text-gray-500">\n'
        '                  این فقط یک پیش‌نمایش محلی است؛ درخواست واقعی ارسال یا ذخیره نشده است.\n'
        '                </p>',
        "non-submitting demo confirmation",
    )
    text = replace_once(text, "                  ثبت درخواست دیگر", "                  بازگشت به فرم", "demo-form reset label")
    text = replace_once(
        text,
        '                <p className="text-center text-[10px] text-gray-300">\n'
        '                  اطلاعات شما فقط برای هماهنگی دمو استفاده می‌شود.\n'
        '                </p>',
        '                <p className="text-center text-[10px] text-gray-500">\n'
        '                  پیش‌نمایش محلی است؛ اطلاعات واردشده ارسال یا ذخیره نمی‌شوند.\n'
        '                </p>',
        "demo-form data-use disclosure",
    )
    demo.write_text(text, encoding="utf-8")

    vite = source / "vite.config.ts"
    text = vite.read_text(encoding="utf-8")
    text = replace_once(
        text,
        "export default defineConfig({\n",
        'export default defineConfig({\n  base: "./",\n  build: { modulePreload: { polyfill: false } },\n',
        "relative GitHub Pages asset base",
    )
    vite.write_text(text, encoding="utf-8")

    public_fonts = source / "public" / "assets" / "fonts"
    public_fonts.mkdir(parents=True, exist_ok=True)
    for name in FONT_NAMES:
        origin = ROOT / "visual-preview" / "assets" / "fonts" / name
        if not origin.is_file():
            raise SystemExit(f"missing repository-local variable font: {origin}")
        digest = hashlib.sha256(origin.read_bytes()).hexdigest()
        if digest != FONT_SHA256[name]:
            raise SystemExit(f"variable font SHA-256 changed for {name}: {digest}")
        shutil.copyfile(origin, public_fonts / name)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="write rebuilt homepage to visual-preview/index.html")
    mode.add_argument("--check", action="store_true", help="fail unless current homepage matches the ZIP-derived build")
    args = parser.parse_args()

    try:
        archive_bytes = subprocess.run(
            ["git", "show", ARCHIVE_REF], cwd=ROOT, check=True, capture_output=True
        ).stdout
    except subprocess.CalledProcessError as error:
        raise SystemExit(f"owner-provided source ZIP not found at {ARCHIVE_REF}; fetch origin/main first") from error
    digest = hashlib.sha256(archive_bytes).hexdigest()
    if digest != EXPECTED_ARCHIVE_SHA256:
        raise SystemExit(f"source ZIP SHA-256 changed: expected {EXPECTED_ARCHIVE_SHA256}, got {digest}")

    with tempfile.TemporaryDirectory(prefix="cpms-zip-preview-") as temporary:
        source = Path(temporary) / "source"
        source.mkdir()
        with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
            if archive.testzip() is not None:
                raise SystemExit("owner-provided source ZIP failed its integrity check")
            for item in archive.infolist():
                target = (source / item.filename).resolve()
                if source.resolve() not in target.parents and target != source.resolve():
                    raise SystemExit(f"unsafe path in owner-provided source ZIP: {item.filename}")
                if item.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.read(item))

        patch_project(source)
        subprocess.run(["npm", "ci", "--no-audit", "--no-fund"], cwd=source, check=True)
        subprocess.run(["npm", "run", "build"], cwd=source, check=True)
        built = source / "dist" / "index.html"
        if not built.is_file():
            raise SystemExit("Vite build did not emit dist/index.html")
        for name in FONT_NAMES:
            emitted = source / "dist" / "assets" / "fonts" / name
            expected = ROOT / "visual-preview" / "assets" / "fonts" / name
            if not emitted.is_file() or emitted.read_bytes() != expected.read_bytes():
                raise SystemExit(f"built local font differs from the reviewed preview asset: {name}")
        generated = built.read_bytes()
        if args.write:
            OUTPUT.write_bytes(generated)
            print(f"WROTE: {OUTPUT.relative_to(ROOT)} ({len(generated):,} bytes)")
        else:
            current = OUTPUT.read_bytes() if OUTPUT.is_file() else b""
            if current != generated:
                raise SystemExit("visual-preview/index.html differs from the reproducible ZIP-derived build; run scripts/build-zip-preview.py --write")
            print(f"PASS: ZIP-derived homepage build matches visual-preview/index.html ({len(generated):,} bytes)")

    print(f"SOURCE ZIP SHA-256: {digest}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as error:
        print(f"build command failed with exit code {error.returncode}: {error.cmd}", file=sys.stderr)
        raise SystemExit(error.returncode)
