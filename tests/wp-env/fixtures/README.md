# CI-only WordPress fixtures

These files are copied by `tests/browser/demo-delivery.mjs` into the mapped
`tests/wp-env/mu-plugins/` directory (bind-mounted to the wp-env container's
`wp-content/mu-plugins`) for bounded phases of the CI run, and are always
removed again afterwards:

- `cpms-ci-mail-intercept.php` — intercepts `wp_mail()` via the `pre_wp_mail`
  filter so no CI test can ever reach a real mail transport; every call is
  logged to `wp-content/cpms-ci-mail-log.jsonl` (synthetic data, deleted by
  the test) and reports success or failure depending on the presence of the
  `.cpms-ci-force-fail` marker file. Defines NO activation.
- `cpms-ci-enable-delivery.php` — defines `CPMS_LEAD_DELIVERY_ENABLED` as
  true, simulating what the environment owner's wp-config.php does on the
  authorized live host. Contains no recipient, no transport, no secret.

The separation is deliberate: with only the interception fixture active,
CI proves the disabled default sends ZERO mail even though the whole mail
path is observable; adding the activation fixture then switches the form to
the live code path against the intercepted mail layer only.

NEITHER FILE MAY EVER BE INSTALLED ON A REAL HOST. They exist solely for the
ephemeral CI container started from `.wp-env.json`.
