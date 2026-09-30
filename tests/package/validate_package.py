#!/usr/bin/env python3
"""Validate a Koorosh TEST-HOST TRANSFER PACKAGE directory (ZIP + manifest + SHA256SUMS).

Usage: validate_package.py <dir> [--expect-sha <commit sha>]

Practical checks only (layout, identity, inventory, forbidden file names, a few
high-signal secret patterns). This is NOT exhaustive secret detection.
"""
import hashlib
import json
import os
import re
import sys
import zipfile

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "scripts"))
import importlib.util  # noqa: E402

_spec = importlib.util.spec_from_file_location(
    "package_koorosh_theme", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "scripts", "package-koorosh-theme.py"))
packager = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(packager)

REQUIRED = [
    "koorosh/style.css", "koorosh/functions.php", "koorosh/index.php", "koorosh/header.php",
    "koorosh/footer.php", "koorosh/404.php", "koorosh/page-elementor.php", "koorosh/demo-form.php",
    "koorosh/demo-form.js", "koorosh/nav.js", "koorosh/foundation.css", "koorosh/inc/theme-settings.php",
    "koorosh/fonts/Vazirmatn-Regular.woff2", "koorosh/fonts/Vazirmatn-Bold.woff2", "koorosh/fonts/OFL.txt",
]
ALLOWED_BINARY_SUFFIX = (".woff2",)
# Forbidden path components / names (case-insensitive).
FORBIDDEN_NAME = re.compile(
    r"(^|/)(\.git(attributes|ignore|hub)?|\.github|node_modules|tests?|reconstruction|design-system|docs|scripts|"
    r"dist|\.wp-env(\.override)?\.json|wp-config[^/]*|\.env[^/]*|\.htaccess|\.htpasswd|\.ds_store|thumbs\.db|"
    r"id_rsa[^/]*|id_ed25519[^/]*|\.npmrc|\.netrc|credentials[^/]*|debug\.log|"
    r"elementor-pro[^/]*|elementor_pro[^/]*|plugins|mu-plugins|uploads|backups?)(/|$)"
    r"|\.(sql|sqlite3?|wpress|gz|tgz|zip|tar|7z|rar|pem|key|p12|pfx|keystore|log|map|bak|orig|swp|kit|xml)$"
    r"|(^|/)[^/]*(licen[sc]e[-_]?key|activator|nulled|crack)[^/]*$",
    re.I,
)
SECRET_PATTERNS = [
    ("private key block", re.compile(rb"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("AWS access key id", re.compile(rb"\bAKIA[0-9A-Z]{16}\b")),
    ("GitHub token", re.compile(rb"\bgh[pousr]_[A-Za-z0-9]{30,}\b")),
    ("Slack token", re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("wp-config DB credential define", re.compile(rb"define\(\s*['\"](DB_PASSWORD|AUTH_KEY|SECURE_AUTH_KEY|LOGGED_IN_KEY|NONCE_KEY)['\"]")),
    ("SMTP password assignment", re.compile(rb"(smtp|mail)[_-]?(pass(word)?|secret)['\"]?\s*[:=]\s*['\"][^'\"\s]{4,}", re.I)),
]
ZIP_MAGIC = b"PK\x03\x04"
SHA_RE = re.compile(r"^[0-9a-f]{40}$")


def validate(dir_path, expect_sha=None):
    errors = []
    err = errors.append

    manifest_path = os.path.join(dir_path, "koorosh-transfer-manifest.json")
    sums_path = os.path.join(dir_path, "SHA256SUMS")
    for p in (manifest_path, sums_path):
        if not os.path.isfile(p):
            err(f"missing {os.path.basename(p)}")
    if errors:
        return errors
    with open(manifest_path, encoding="utf-8") as fh:
        m = json.load(fh)

    zip_name = m.get("zip_file", "")
    zip_path = os.path.join(dir_path, zip_name)
    if not zip_name or os.path.basename(zip_name) != zip_name or not os.path.isfile(zip_path):
        err(f"manifest zip_file missing on disk: {zip_name!r}")
        return errors

    # ---- archive opens, CRCs good ------------------------------------------
    try:
        zf = zipfile.ZipFile(zip_path)
    except zipfile.BadZipFile as exc:
        err(f"archive does not open: {exc}")
        return errors
    with zf:
        bad = zf.testzip()
        if bad:
            err(f"CRC failure in member {bad}")
        infos = zf.infolist()
        names = [i.filename for i in infos]

        # ---- layout --------------------------------------------------------
        if len(names) != len(set(names)):
            err("duplicate member names")
        if any(n.endswith("/") for n in names):
            err("explicit directory entries present (installable layout uses file entries only)")
        roots = {n.split("/", 1)[0] for n in names}
        if roots != {"koorosh"}:
            err(f"root layout must be exactly koorosh/, got {sorted(roots)}")
        for n in names:
            if n.startswith("/") or ".." in n.split("/") or "\\" in n:
                err(f"unsafe member path: {n}")
            if any(i.flag_bits & 0x1 for i in infos):
                err("encrypted member")
                break
        if names != sorted(names):
            err("members are not in sorted order (deterministic build contract)")
        if any(i.date_time != (1980, 1, 1, 0, 0, 0) for i in infos):
            err("non-normalized member timestamps (deterministic build contract)")

        # ---- required files / identity ---------------------------------------
        for req in REQUIRED:
            if req not in names:
                err(f"required file missing: {req}")

        style = zf.read("koorosh/style.css").decode("utf-8") if "koorosh/style.css" in names else ""
        hm = re.search(r"^[ \t]*Theme Name:[ \t]*(.*?)[ \t]*$", style, re.M)
        if not hm or hm.group(1) != packager.EXPECTED_THEME_NAME:
            err(f"Theme Name must be {packager.EXPECTED_THEME_NAME}, got {hm.group(1) if hm else None!r}")
        if re.search(r"^[ \t]*Template:", style, re.M):
            err("style.css declares a Template: parent dependency")
        vm = re.search(r"^[ \t]*Version:[ \t]*(\S+)[ \t]*$", style, re.M)
        if not vm or not re.fullmatch(r"\d+\.\d+\.\d+", vm.group(1)):
            err("style.css Version header missing or malformed")
        for f in ("koorosh/fonts/Vazirmatn-Regular.woff2", "koorosh/fonts/Vazirmatn-Bold.woff2"):
            if f in names and not zf.read(f).startswith(b"wOF2"):
                err(f"{f} is not a WOFF2 file")

        # ---- forbidden names / content --------------------------------------
        for n in names:
            rel = n[len("koorosh/"):] if n.startswith("koorosh/") else n
            if FORBIDDEN_NAME.search(rel):
                err(f"forbidden file in package: {n}")
            data = zf.read(n)
            if n.endswith(ALLOWED_BINARY_SUFFIX):
                continue
            if data.startswith(ZIP_MAGIC):
                err(f"nested archive: {n}")
            if b"\x00" in data:
                err(f"unexpected binary content: {n}")
            for label, pat in SECRET_PATTERNS:
                if pat.search(data):
                    err(f"possible secret ({label}) in {n}")
            if n.endswith(".php") and re.search(rb"Plugin Name:\s*Elementor Pro", data):
                err(f"Elementor Pro plugin header in {n}")

        # ---- manifest <-> archive agreement ---------------------------------
        inv = {f["path"]: f for f in m.get("files", [])}
        if sorted(inv) != sorted(names):
            err("manifest file inventory differs from archive members")
        for n in names:
            if n in inv:
                data = zf.read(n)
                if hashlib.sha256(data).hexdigest() != inv[n]["sha256"] or len(data) != inv[n]["size"]:
                    err(f"manifest hash/size mismatch: {n}")

    # ---- manifest fields --------------------------------------------------------
    zsha = hashlib.sha256(open(zip_path, "rb").read()).hexdigest()
    if m.get("zip_sha256") != zsha:
        err("manifest zip_sha256 != actual ZIP SHA-256")
    if not SHA_RE.match(m.get("source_commit_sha", "")):
        err("source_commit_sha is not a 40-hex commit SHA")
    if expect_sha and m.get("source_commit_sha") != expect_sha:
        err(f"source_commit_sha {m.get('source_commit_sha')} != expected {expect_sha}")
    if not m.get("source_commit_sha", "x")[:12] in zip_name:
        err("ZIP file name does not carry the 12-char source SHA")
    if not re.fullmatch(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ", m.get("build_timestamp_utc", "")):
        err("build_timestamp_utc malformed")
    if m.get("repository") in (None, ""):
        err("repository missing")
    if m.get("theme_name") != packager.EXPECTED_THEME_NAME or m.get("theme_slug") != "koorosh":
        err("manifest theme identity mismatch")
    if m.get("theme_version") != (vm.group(1) if vm else None):
        err("manifest theme_version != style.css Version")
    wp_ver, el_ver = packager.read_pins()
    if m.get("expected_wordpress_reference_version") != wp_ver or m.get("expected_elementor_free_reference_version") != el_ver:
        err("manifest reference versions differ from .wp-env.json pins")
    for key in ("elementor_pro_included", "production_release", "publication_authorized"):
        if m.get(key) is not False:
            err(f"manifest {key} must be the boolean false")
    if m.get("source_tree_dirty") is not False and os.environ.get("KOOROSH_ALLOW_DIRTY") != "1":
        err("manifest source_tree_dirty is not false (package not bound to a clean commit)")
    if "release" in m.get("artifact_kind", "").lower() and "test" not in m.get("artifact_kind", "").lower():
        err("artifact_kind must not read as a release")

    # ---- SHA256SUMS ---------------------------------------------------------------
    listed = {}
    for line in open(sums_path, encoding="utf-8").read().splitlines():
        mm = re.fullmatch(r"([0-9a-f]{64})  (\S+)", line)
        if not mm:
            err(f"malformed SHA256SUMS line: {line!r}")
            continue
        listed[mm.group(2)] = mm.group(1)
    if set(listed) != {zip_name, "koorosh-transfer-manifest.json"}:
        err(f"SHA256SUMS must list exactly the ZIP and manifest, got {sorted(listed)}")
    for name, digest in listed.items():
        p = os.path.join(dir_path, name)
        if os.path.isfile(p) and hashlib.sha256(open(p, "rb").read()).hexdigest() != digest:
            err(f"SHA256SUMS mismatch: {name}")
    return errors


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    expect = None
    if "--expect-sha" in argv:
        expect = argv[argv.index("--expect-sha") + 1]
    errs = validate(argv[0], expect)
    for e in errs:
        print(f"FAIL: {e}")
        print(f"::error title=Package validation::{e}")
    if errs:
        return 1
    print("PASS: package validation (archive, layout, identity, inventory, forbidden files, checksums, manifest)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
