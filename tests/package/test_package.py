#!/usr/bin/env python3
"""Self-contained tests for the Koorosh transfer package (no WordPress needed).

Covers: deterministic ZIP (two builds, byte-identical), package inventory,
checksum generation, forbidden-file / identity / secret rejection (negative
fixtures), unclassified-file refusal, manifest honesty flags.
Run: python3 tests/package/test_package.py
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
os.environ["KOOROSH_ALLOW_DIRTY"] = "1"  # local/dev trees may be dirty; CI builds use --require-clean
import validate_package as vp  # noqa: E402

packager = vp.packager
passed = failed = 0


def check(name, cond, detail=""):
    global passed, failed
    if cond:
        passed += 1
        print(f"PASS: {name}")
    else:
        failed += 1
        print(f"FAIL: {name} {detail}")
        print(f"::error title=Package test::{name} {detail}")


def build(out):
    subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "package-koorosh-theme.py"), "--out-dir", out,
                    "--build-timestamp", "2026-01-01T00:00:00Z"], check=True, capture_output=True, text=True)
    return out


def rewrite_zip(src_zip, dst_zip, drop=(), add=None, replace=None):
    add, replace = add or {}, replace or {}
    with zipfile.ZipFile(src_zip) as zin, zipfile.ZipFile(dst_zip, "w", zipfile.ZIP_STORED) as zout:
        for i in zin.infolist():
            if i.filename in drop:
                continue
            data = replace.get(i.filename, zin.read(i.filename))
            zi = zipfile.ZipInfo(i.filename, date_time=(1980, 1, 1, 0, 0, 0))
            zout.writestr(zi, data)
        for name, data in add.items():
            zout.writestr(zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0)), data)


def mutated(good, **kw):
    """Copy the good package dir, rewrite the ZIP, re-sync manifest/SUMS so ONLY the targeted rule should trip."""
    d = tempfile.mkdtemp(prefix="koorosh-neg-")
    shutil.copytree(good, d, dirs_exist_ok=True)
    m = json.load(open(os.path.join(d, "koorosh-transfer-manifest.json"), encoding="utf-8"))
    zp = os.path.join(d, m["zip_file"])
    rewrite_zip(os.path.join(good, m["zip_file"]), zp, **kw)
    m["zip_sha256"] = hashlib.sha256(open(zp, "rb").read()).hexdigest()
    with zipfile.ZipFile(zp) as z:
        m["files"] = [{"path": i.filename, "size": i.file_size, "sha256": hashlib.sha256(z.read(i.filename)).hexdigest()}
                      for i in z.infolist()]
    json.dump(m, open(os.path.join(d, "koorosh-transfer-manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    with open(os.path.join(d, "SHA256SUMS"), "w") as fh:
        for n in (m["zip_file"], "koorosh-transfer-manifest.json"):
            fh.write(f"{hashlib.sha256(open(os.path.join(d, n), 'rb').read()).hexdigest()}  {n}\n")
    return d


def expect_reject(name, keyword, **kw):
    d = mutated(GOOD_A, **kw)
    errs = vp.validate(d)
    check(name, any(keyword in e for e in errs), f"errors={errs}")
    shutil.rmtree(d, ignore_errors=True)


tmp = tempfile.mkdtemp(prefix="koorosh-pkg-")
GOOD_A, GOOD_B = build(os.path.join(tmp, "a")), build(os.path.join(tmp, "b"))
try:
    m = json.load(open(os.path.join(GOOD_A, "koorosh-transfer-manifest.json"), encoding="utf-8"))
    zip_a, zip_b = (os.path.join(g, m["zip_file"]) for g in (GOOD_A, GOOD_B))

    # 1. determinism + baseline validity
    check("two builds of the same tree are byte-identical", open(zip_a, "rb").read() == open(zip_b, "rb").read())
    check("good package passes validation", vp.validate(GOOD_A) == [], vp.validate(GOOD_A))
    check("manifest JSON is identical across builds for a fixed timestamp",
          open(os.path.join(GOOD_A, "koorosh-transfer-manifest.json"), "rb").read() == open(os.path.join(GOOD_B, "koorosh-transfer-manifest.json"), "rb").read())

    # 2. inventory = exactly the classified theme files
    included, excluded = packager.list_source_files()
    with zipfile.ZipFile(zip_a) as z:
        names = z.namelist()
    check("archive inventory equals classified source inventory", names == [f"koorosh/{r}" for r in included])
    check("only documented file is excluded (fonts/README.md)", excluded == ["fonts/README.md"], excluded)
    check("single root directory koorosh/", {n.split('/')[0] for n in names} == {"koorosh"})

    # 3. checksums
    sums = dict(reversed(l.split("  ")) for l in open(os.path.join(GOOD_A, "SHA256SUMS")).read().splitlines())
    check("SHA256SUMS covers ZIP + manifest and matches", sums[m["zip_file"]] == hashlib.sha256(open(zip_a, "rb").read()).hexdigest() == m["zip_sha256"])

    # 4. manifest honesty
    check("manifest: elementor_pro_included is false", m["elementor_pro_included"] is False)
    check("manifest: production_release is false", m["production_release"] is False)
    check("manifest: publication_authorized is false", m["publication_authorized"] is False)
    check("manifest: theme identity + version from style.css",
          m["theme_name"] == "کوروش" and m["theme_slug"] == "koorosh" and m["theme_version"] == packager.read_style_headers()["Version"])
    check("manifest: source SHA is the checked-out HEAD", m["source_commit_sha"] == subprocess.run(["git", "-C", ROOT, "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip())
    check("manifest: reference versions come from .wp-env.json", (m["expected_wordpress_reference_version"], m["expected_elementor_free_reference_version"]) == packager.read_pins())
    check("artifact kind says TEST, never release", "TEST" in m["artifact_kind"] and "production" not in m["artifact_kind"].lower())

    # 5. negative fixtures: validator must reject
    expect_reject("rejects .env file", "forbidden file", add={"koorosh/.env": b"X=1\n"})
    expect_reject("rejects wp-config.php", "forbidden file", add={"koorosh/wp-config.php": b"<?php\n"})
    expect_reject("rejects SQL dump", "forbidden file", add={"koorosh/dump.sql": b"-- dump\n"})
    expect_reject("rejects tests/ directory", "forbidden file", add={"koorosh/tests/a.php": b"<?php\n"})
    expect_reject("rejects .git metadata", "forbidden file", add={"koorosh/.git/config": b"[core]\n"})
    expect_reject("rejects node_modules", "forbidden file", add={"koorosh/node_modules/x.js": b"//\n"})
    expect_reject("rejects reconstruction files", "forbidden file", add={"koorosh/reconstruction/recipe.mjs": b"//\n"})
    expect_reject("rejects Elementor Pro archive name", "forbidden file", add={"koorosh/elementor-pro.zip": b"PK\x03\x04"})
    expect_reject("rejects nested archive content", "nested archive", add={"koorosh/inc/a.php": b"PK\x03\x04junk"})
    expect_reject("rejects private key material", "possible secret", add={"koorosh/inc/k.php": b"<?php // -----BEGIN RSA PRIVATE KEY-----\n"})
    expect_reject("rejects Elementor Pro plugin header", "Elementor Pro plugin header", add={"koorosh/inc/p.php": b"<?php\n/* Plugin Name: Elementor Pro */\n"})
    expect_reject("rejects wrong root dir", "root layout", add={"other/x.php": b"<?php\n"})
    expect_reject("rejects missing style.css", "required file missing", drop={"koorosh/style.css"})
    expect_reject("rejects missing font asset", "required file missing", drop={"koorosh/fonts/Vazirmatn-Bold.woff2"})
    with zipfile.ZipFile(zip_a) as z:
        style = z.read("koorosh/style.css").decode()
    expect_reject("rejects Template: parent dependency", "Template:", replace={"koorosh/style.css": style.replace("Text Domain:", "Template: hello-elementor\nText Domain:").encode()})
    expect_reject("rejects wrong Theme Name", "Theme Name", replace={"koorosh/style.css": style.replace("Theme Name: کوروش", "Theme Name: Other").encode()})

    # manifest-level negatives
    for field, bad in (("elementor_pro_included", True), ("production_release", True), ("publication_authorized", True)):
        d = tempfile.mkdtemp(prefix="koorosh-neg-")
        shutil.copytree(GOOD_A, d, dirs_exist_ok=True)
        mp = os.path.join(d, "koorosh-transfer-manifest.json")
        mm = json.load(open(mp, encoding="utf-8")); mm[field] = bad
        json.dump(mm, open(mp, "w", encoding="utf-8"), ensure_ascii=False)
        errs = vp.validate(d)
        check(f"rejects manifest {field}=true", any(field in e for e in errs), errs)
        shutil.rmtree(d, ignore_errors=True)
    d = tempfile.mkdtemp(prefix="koorosh-neg-")
    shutil.copytree(GOOD_A, d, dirs_exist_ok=True)
    with open(os.path.join(d, m["zip_file"]), "ab") as fh:
        fh.write(b"tamper")
    check("rejects ZIP tampered after checksum", any("sha256" in e.lower() or "SHA256SUMS" in e or "does not open" in e for e in vp.validate(d)))
    shutil.rmtree(d, ignore_errors=True)
    check("rejects wrong expected source SHA", any("expected" in e for e in vp.validate(GOOD_A, "0" * 40)))

    # 6. packager refuses unclassified source files (simulate via temp theme copy)
    src = os.path.join(tmp, "theme-copy")
    shutil.copytree(os.path.join(ROOT, "themes", "koorosh"), src)
    open(os.path.join(src, "secret-notes.txt"), "w").write("x")
    try:
        packager.list_source_files(src)
        check("packager refuses unclassified file", False, "no error raised")
    except SystemExit as exc:
        check("packager refuses unclassified file", "unclassified" in str(exc))

    # 7. Workflow / repo policy: top-level read-only, job-scoped main-only pre-release after install proof, Pro never fetched
    wf = open(os.path.join(ROOT, ".github", "workflows", "wordpress-elementor-smoke.yml"), encoding="utf-8").read()
    check("workflow builds the package with --require-clean from the exact head SHA", "--require-clean" in wf and "ref: ${{ github.event.pull_request.head.sha || github.sha }}" in wf)
    check("workflow installs the ZIP via tests/package/install-check.sh", "bash tests/package/install-check.sh" in wf)
    check("workflow uploads a koorosh-test-host-transfer-<sha> artifact with bounded retention", "name: koorosh-test-host-transfer-${{ github.event.pull_request.head.sha || github.sha }}" in wf and "retention-days: 14" in wf)
    check("workflow default stays read-only and scopes contents: write to transfer job only", "permissions:\n  contents: read" in wf and wf.count("contents: write") == 1)
    check("workflow publishes only a main-gated --prerelease after ZIP-install proof (never a production release)",
          "github.ref == 'refs/heads/main'" in wf and "--prerelease" in wf and "--latest" not in wf
          and "koorosh-test-v" in wf and "Test Host Transfer Build" in wf
          and wf.index("bash tests/package/install-check.sh") < wf.index("gh release create"))
    check("no Elementor Pro download/URL/secret in workflow", not any(t in wf.lower() for t in ("elementor-pro.zip", "secrets.")))
    pkg_env = json.load(open(os.path.join(HERE, ".wp-env.json"), encoding="utf-8"))
    root_env = json.load(open(os.path.join(ROOT, ".wp-env.json"), encoding="utf-8"))
    check("clean-install wp-env config pins equal root pins and map no theme",
          (pkg_env["core"], pkg_env["phpVersion"], pkg_env["plugins"], pkg_env["themes"]) == (root_env["core"], root_env["phpVersion"], root_env["plugins"], []))
    gi = open(os.path.join(ROOT, ".gitignore"), encoding="utf-8").read()
    check("generated ZIP output is git-ignored", "dist/" in gi and "tests/package/pkg/" in gi)
    tracked = subprocess.run(["git", "-C", ROOT, "ls-files"], capture_output=True, text=True).stdout.split("\n")
    archive_files = [t for t in tracked if t.lower().endswith((".zip", ".tgz", ".tar", ".gz", ".7z", ".rar"))]
    allowed_archives = {
        "visual-preview/koorosh-design-preview.zip",
        "modern-glassmorphic-plugin-website (2).zip",  # Owner source ZIP fetched from origin/main by the preview build.
    }
    check("only the owner source ZIP and explicitly required visual-preview bundle may be tracked as archives",
          not [path for path in archive_files if path not in allowed_archives], archive_files)
finally:
    shutil.rmtree(tmp, ignore_errors=True)

print(f"== Package tests: {passed} passed, {failed} failed ==")
sys.exit(1 if failed else 0)
