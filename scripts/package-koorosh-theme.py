#!/usr/bin/env python3
"""Build the Koorosh TEST-HOST TRANSFER PACKAGE (installable theme ZIP).

NOT a production release, NOT publication authorization, NOT Elementor Pro
acceptance. Produces, for the exact checked-out source commit:

  koorosh-<version>-test-build-<sha12>.zip   WordPress-installable theme (root dir koorosh/)
  koorosh-transfer-manifest.json             machine-readable manifest (binds ZIP <-> source SHA)
  SHA256SUMS                                 `sha256sum -c` compatible checksum file

Packaging rules (single source of truth for CI and tests):
  * Allowlist by file type; every file under themes/koorosh must be either
    packaged or named in EXCLUDED. An unclassified file FAILS the build, so a
    new file is never silently shipped or silently dropped.
  * Bit-for-bit deterministic ZIP: sorted member order, fixed 1980-01-01
    timestamps, fixed permissions, no extra fields, ZIP_STORED (no dependence
    on a zlib build). The build timestamp lives only in the manifest, never
    in the ZIP.
  * Standard library only.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import zipfile
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
THEME_SRC = os.path.join(ROOT, "themes", "koorosh")
SLUG = "koorosh"
EXPECTED_THEME_NAME = "کوروش"

# Runtime-required file types.
INCLUDE_SUFFIXES = (".php", ".css", ".js", ".woff2")
# Explicit single-file additions (license text must travel with the font).
INCLUDE_FILES = {"fonts/OFL.txt"}
# Present in Git, deliberately not shipped (documentation only).
EXCLUDED = {"fonts/README.md"}

ZIP_EPOCH = (1980, 1, 1, 0, 0, 0)
FILE_MODE = 0o644 << 16
SCHEMA = 1


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def list_source_files(src=THEME_SRC):
    """Return (included, excluded) relative POSIX paths; fail on unclassified files."""
    included, excluded, unknown = [], [], []
    for dirpath, dirnames, filenames in os.walk(src):
        dirnames.sort()
        for name in sorted(filenames):
            rel = os.path.relpath(os.path.join(dirpath, name), src).replace(os.sep, "/")
            if rel in EXCLUDED:
                excluded.append(rel)
            elif rel in INCLUDE_FILES or rel.endswith(INCLUDE_SUFFIXES):
                included.append(rel)
            else:
                unknown.append(rel)
    if unknown:
        raise SystemExit(
            "FAIL: unclassified file(s) under themes/koorosh (add to INCLUDE rules or EXCLUDED "
            "deliberately): " + ", ".join(sorted(unknown))
        )
    return sorted(included), sorted(excluded)


def read_style_headers(src=THEME_SRC):
    with open(os.path.join(src, "style.css"), encoding="utf-8") as fh:
        head = fh.read(8192)
    headers = {}
    for key in ("Theme Name", "Version", "Template", "Text Domain"):
        m = re.search(r"^[ \t]*" + re.escape(key) + r":[ \t]*(.*?)[ \t]*$", head, re.M)
        if m:
            headers[key] = m.group(1)
    return headers


def read_pins():
    with open(os.path.join(ROOT, ".wp-env.json"), encoding="utf-8") as fh:
        cfg = json.load(fh)
    wp = re.fullmatch(r"WordPress/WordPress#(\d+(?:\.\d+)+)", cfg.get("core", ""))
    el = re.search(r"/elementor\.(\d+(?:\.\d+)+)\.zip$", (cfg.get("plugins") or [""])[0])
    if not wp or not el:
        raise SystemExit("FAIL: .wp-env.json WordPress/Elementor pins missing or malformed")
    return wp.group(1), el.group(1)


def git(*args):
    return subprocess.run(["git", "-C", ROOT, *args], check=True, capture_output=True, text=True).stdout.strip()


def build_zip(zip_path, files, src=THEME_SRC):
    """Write the deterministic ZIP. Returns list of {path,size,sha256} (paths relative to koorosh/)."""
    inventory = []
    os.makedirs(os.path.dirname(os.path.abspath(zip_path)), exist_ok=True)
    tmp = zip_path + ".tmp"
    with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_STORED) as zf:
        for rel in sorted(files):
            with open(os.path.join(src, rel), "rb") as fh:
                data = fh.read()
            info = zipfile.ZipInfo(f"{SLUG}/{rel}", date_time=ZIP_EPOCH)
            info.compress_type = zipfile.ZIP_STORED
            info.external_attr = FILE_MODE
            info.create_system = 3  # fixed, independent of the build OS
            info.extra = b""
            zf.writestr(info, data)
            inventory.append({"path": f"{SLUG}/{rel}", "size": len(data), "sha256": sha256_bytes(data)})
    os.replace(tmp, zip_path)
    return inventory


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out-dir", default=os.path.join(ROOT, "dist", "transfer"))
    ap.add_argument("--source-sha", default=os.environ.get("KOOROSH_SOURCE_SHA", ""),
                    help="must equal the checked-out HEAD (default: HEAD)")
    ap.add_argument("--build-timestamp", default=os.environ.get("KOOROSH_BUILD_TIMESTAMP", ""),
                    help="UTC ISO-8601; manifest only (default: now)")
    ap.add_argument("--repository", default=os.environ.get("GITHUB_REPOSITORY", "bia2on2on/Site-p-doctor-"))
    ap.add_argument("--require-clean", action="store_true", help="fail if the work tree is not clean (CI)")
    args = ap.parse_args(argv)

    head = git("rev-parse", "HEAD")
    if args.source_sha and args.source_sha != head:
        raise SystemExit(f"FAIL: --source-sha {args.source_sha} != checked-out HEAD {head}")
    dirty = bool(git("status", "--porcelain", "--untracked-files=all"))
    if dirty and args.require_clean:
        raise SystemExit("FAIL: work tree is not clean; refusing to bind a package to a commit SHA")

    headers = read_style_headers()
    if headers.get("Theme Name") != EXPECTED_THEME_NAME:
        raise SystemExit(f"FAIL: Theme Name must be {EXPECTED_THEME_NAME!r}, got {headers.get('Theme Name')!r}")
    if "Template" in headers:
        raise SystemExit("FAIL: style.css declares a Template: parent; Koorosh must be standalone")
    version = headers.get("Version", "")
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise SystemExit(f"FAIL: style.css Version header missing or not MAJOR.MINOR.PATCH: {version!r}")

    files, excluded = list_source_files()
    wp_ver, el_ver = read_pins()

    os.makedirs(args.out_dir, exist_ok=True)
    zip_name = f"koorosh-{version}-test-build-{head[:12]}.zip"
    zip_path = os.path.join(args.out_dir, zip_name)
    inventory = build_zip(zip_path, files)
    zip_sha = sha256_file(zip_path)

    ts = args.build_timestamp or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifest = {
        "schema_version": SCHEMA,
        "artifact_kind": "TEST-HOST TRANSFER PACKAGE (TEST BUILD)",
        "repository": args.repository,
        "source_commit_sha": head,
        "source_tree_dirty": dirty,
        "build_timestamp_utc": ts,
        "theme_name": headers["Theme Name"],
        "theme_slug": SLUG,
        "theme_version": version,
        "zip_file": zip_name,
        "zip_sha256": zip_sha,
        "zip_size_bytes": os.path.getsize(zip_path),
        "zip_layout": f"single root directory {SLUG}/",
        "zip_deterministic": "same source tree -> byte-identical ZIP (sorted order, fixed timestamps/modes, stored); the build timestamp is in this manifest only",
        "expected_wordpress_reference_version": wp_ver,
        "expected_elementor_free_reference_version": el_ver,
        "elementor_pro_included": False,
        "production_release": False,
        "publication_authorized": False,
        "host_acceptance": "NOT RUN",
        "elementor_pro_acceptance": "NOT RUN",
        "litespeed_acceptance": "NOT RUN",
        "lead_delivery_default": "OFF (environment constant + admin switch; no secrets in package)",
        "excluded_from_package": excluded,
        "files": inventory,
    }
    with open(os.path.join(args.out_dir, "koorosh-transfer-manifest.json"), "w", encoding="utf-8", newline="\n") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2, sort_keys=False)
        fh.write("\n")

    # Checksums cover the ZIP and the manifest; `sha256sum -c SHA256SUMS` works from the artifact dir.
    with open(os.path.join(args.out_dir, "SHA256SUMS"), "w", encoding="utf-8", newline="\n") as fh:
        for name in (zip_name, "koorosh-transfer-manifest.json"):
            fh.write(f"{sha256_file(os.path.join(args.out_dir, name))}  {name}\n")

    print(f"built {zip_name} sha256={zip_sha} files={len(files)} source={head} dirty={dirty}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
