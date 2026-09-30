# CI mu-plugins bind mount (mapped by `.wp-env.json`)

This directory is bind-mounted into the ephemeral wp-env container at
`wp-content/mu-plugins` (WordPress auto-loads every top-level `*.php` file
there, but ignores this README).

Rules:

- **No `*.php` file may be committed here.** With the directory PHP-free, every
  CI run starts with lead delivery in its safe default (disabled) mode — the
  environment itself proves "deployment alone never enables delivery".
- `tests/browser/demo-delivery.mjs` copies the CI fixtures from
  `tests/wp-env/fixtures/` into this directory at runtime to simulate, inside
  the disposable container only, the environment-owned activation control and
  to intercept `wp_mail()` so automated tests never perform real delivery.
  It removes them again (always, including on failure) before finishing.
- These fixtures exist ONLY for the ephemeral CI environment. They must never
  be installed on any real, staging, or production host, and they contain no
  credentials, no recipient addresses, and no mail transport.
