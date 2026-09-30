/**
 * CI proof of the Demo / Consultation lead-delivery state machine.
 *
 * Runs ONLY inside the ephemeral wp-env container started from .wp-env.json
 * (this script is executed by .github/workflows/wordpress-elementor-smoke.yml
 * right after tests/browser/demo.mjs, which publishes the /demo/ page).
 *
 * Safety contract:
 *  - wp_mail() is intercepted via the pre_wp_mail CI fixture, so NO test in
 *    this file can ever reach a real mail transport or send real email;
 *  - activation of delivery is simulated ONLY by a copied must-use fixture
 *    that plays the role the environment owner's wp-config.php plays in
 *    production — the theme itself is never edited;
 *  - all submitted data is synthetic (.test domain, Persian sample values);
 *  - every phase cleans up after itself (fixtures, marker, mail log), so the
 *    remaining page tests keep running in the safe default mode.
 *
 * Proven here (see checks[] in results.json):
 *  - default delivery OFF; disabled mode sends ZERO mail;
 *  - live-mode simulation targets EXACTLY the authorized recipient;
 *  - recipient cannot be overridden by request fields (strict allowlist);
 *  - validated payload maps correctly into a plain-text message;
 *  - invalid nonce, validation errors, honeypot and malformed requests
 *    produce no mail;
 *  - wp_mail failure is surfaced as HANDOFF_FAILED (HTTP 500, error notice),
 *    never as success; wp_mail acceptance is reported truthfully as a
 *    mail-layer handoff only (no receipt/read/response-time promise);
 *  - no lead persistence in the WordPress database;
 *  - the technical non-live banner renders only while delivery is disabled.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const outDir = resolve(import.meta.dirname, 'artifacts/demo-delivery');
mkdirSync(outDir, { recursive: true });

const base = 'http://localhost:8888';
const muDir = resolve(root, 'tests/wp-env/mu-plugins'); // bind-mounted to wp-content/mu-plugins
const fixtureDir = resolve(root, 'tests/wp-env/fixtures');
const interceptFixture = 'cpms-ci-mail-intercept.php';
const enableFixture = 'cpms-ci-enable-delivery.php';
const forceFailMarker = '.cpms-ci-force-fail';
const authorizedRecipient = 'biatoweb@gmail.com';
const expectedSubject = 'درخواست دمو و مشاوره CPMS از وب‌سایت';

const synthetic = {
  name: 'دکتر آزمایشی سینا',
  org: 'کلینیک تخصصی نمونه',
  contact: 'test-clinic@example.test',
  orgType: 'clinic',
  doctorCount: '3-5',
  topic: 'بررسی هماهنگی نوبت و پذیرش در سناریوی آزمایشی',
};
const expectedOrgTypeLabel = 'درمانگاه عمومی یا تخصصی';
const expectedDoctorCountLabel = '۳ تا ۵ پزشک';

const results = { authorizedRecipient, expectedSubject, checks: [], mailLogFinalEntries: 0 };
let failures = 0;

function check(name, condition, detail = '') {
  const pass = condition === true;
  results.checks.push({ name, pass, detail: pass ? undefined : String(detail) });
  if (pass) {
    console.log(`PASS: ${name}`);
  } else {
    failures += 1;
    const message = `FAIL: ${name}${detail ? ` — ${detail}` : ''}`;
    console.error(message);
    console.error(`::error title=Delivery proof FAIL::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  }
}

function wpEnv(args, { timeout = 120_000 } = {}) {
  try {
    return execFileSync(
      resolve(import.meta.dirname, 'node_modules/.bin/wp-env'),
      ['run', 'cli', ...args],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout }
    ).trim();
  } catch (error) {
    throw new Error(`wp-env CLI failed: ${error.stderr?.toString() || error.message}`);
  }
}

function wp(...args) {
  return wpEnv(['wp', ...args]);
}

function wpEval(php) {
  return wp('eval', php);
}

function mailEntries() {
  const raw = wpEval(
    "echo file_exists( WP_CONTENT_DIR . '/cpms-ci-mail-log.jsonl' ) ? file_get_contents( WP_CONTENT_DIR . '/cpms-ci-mail-log.jsonl' ) : '';"
  );
  if (!raw) return [];
  return raw.split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line));
}

function clearMailLog() {
  wpEval(
    "if ( file_exists( WP_CONTENT_DIR . '/cpms-ci-mail-log.jsonl' ) ) { unlink( WP_CONTENT_DIR . '/cpms-ci-mail-log.jsonl' ); } echo 'cleared';"
  );
}

function phpLint(containerPath) {
  try {
    return wpEnv(['php', '-l', containerPath]);
  } catch (error) {
    return String(error.stdout || error.message);
  }
}

function phpFilesInMuDir() {
  if (!existsSync(muDir)) return [];
  return readdirSync(muDir).filter(name => name.toLowerCase().endsWith('.php'));
}

async function getDemoHtml() {
  const res = await fetch(`${base}/demo/`);
  return { status: res.status, html: await res.text() };
}

function extractNonce(html) {
  const match = html.match(/name="cpms_demo_nonce"\s+value="([^"]+)"/);
  return match ? match[1] : null;
}

async function postDemoForm(fields, { ajax = true } = {}) {
  const body = new URLSearchParams(fields);
  if (ajax) body.set('cpms_ajax', '1');
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (ajax) headers['X-Requested-With'] = 'XMLHttpRequest';
  const res = await fetch(`${base}/demo/`, {
    method: 'POST',
    headers,
    body,
    redirect: 'manual',
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, json, text };
}

function validSubmission(extra = {}) {
  // Mirrors the exact field set a real browser submits from the rendered
  // form: the wp_nonce_field() output includes BOTH cpms_demo_nonce and the
  // default _wp_http_referer hidden field, and the submit button is a
  // successful control in a no-JS form POST. (A regression where the strict
  // allowlist rejected a field the rendered form actually contains is what
  // this shape guards against.)
  return {
    cpms_demo_submit: '1',
    cpms_demo_nonce: 'set-by-caller',
    _wp_http_referer: '/demo/',
    cpms_submit_btn: 'ثبت درخواست مشاوره / دمو',
    cpms_contact_name: synthetic.name,
    cpms_org_name: synthetic.org,
    cpms_contact_value: synthetic.contact,
    cpms_org_type: synthetic.orgType,
    cpms_doctor_count: synthetic.doctorCount,
    cpms_discussion_topic: synthetic.topic,
    ...extra,
  };
}

function cleanupFixtures() {
  for (const fixture of [interceptFixture, enableFixture, forceFailMarker]) {
    rmSync(resolve(muDir, fixture), { force: true });
  }
  try {
    clearMailLog();
  } catch {
    // Best effort: a failing wp-env here must not mask the real test result.
  }
}


try {
  // ---- Phase 0: preconditions ------------------------------------------------
  check('precondition: no PHP fixtures committed in the mapped mu-plugins directory (CI default = delivery OFF)', phpFilesInMuDir().length === 0, phpFilesInMuDir().join(', '));
  check('precondition: active theme is koorosh', wp('theme', 'list', '--status=active', '--field=name') === 'koorosh');
  wp('rewrite', 'structure', '/%postname%/');
  const demoPageId = wp('post', 'list', '--post_type=page', '--name=demo', '--field=ID');
  check('precondition: /demo/ page exists and is published by demo.mjs', /^\d+$/.test(demoPageId), `got: ${demoPageId}`);
  if (!/^\d+$/.test(demoPageId)) {
    throw new Error('Demo page missing — run tests/browser/demo.mjs before this script.');
  }
  const initial = await getDemoHtml();
  check('precondition: /demo/ responds 200', initial.status === 200, initial.status);
  check('default mode: technical non-live banner renders before any fixture is installed', initial.html.includes('id="cpms-non-live-banner"'));
  let nonce = extractNonce(initial.html);
  check('default mode: form nonce present in rendered HTML', Boolean(nonce));
  if (!nonce) throw new Error('Could not extract form nonce from /demo/ HTML.');

  // ---- Phase 1: interception only (delivery stays default OFF) ---------------
  copyFileSync(resolve(fixtureDir, interceptFixture), resolve(muDir, interceptFixture));
  const lintIntercept = phpLint(`/var/www/html/wp-content/mu-plugins/${interceptFixture}`);
  check('interception fixture passes php -l inside the container', lintIntercept.includes('No syntax errors detected'), lintIntercept);
  const intercepted = await getDemoHtml();
  check('WordPress still serves /demo/ with the interception fixture active', intercepted.status === 200, intercepted.status);
  nonce = extractNonce(intercepted.html) || nonce;

  const disabledResponse = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce }));
  check(
    'default delivery OFF: valid submission returns success with state delivery_disabled',
    disabledResponse.status === 200 && disabledResponse.json?.success === true && disabledResponse.json?.data?.state === 'delivery_disabled',
    `status=${disabledResponse.status} body=${disabledResponse.text.slice(0, 300)}`
  );
  check(
    'default delivery OFF: response keeps the honest non-live payload (non_live, no storage)',
    disabledResponse.json?.data?.non_live === true && disabledResponse.json?.data?.stored === false,
    JSON.stringify(disabledResponse.json?.data)
  );
  check('disabled mode sends ZERO mail (mail path observable, never called)', mailEntries().length === 0, JSON.stringify(mailEntries().length));

  const honeypotResponse = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce, cpms_website_url: 'http://spam.example/bot' }));
  check(
    'honeypot filled: submission rejected as validation failure',
    honeypotResponse.status === 200 && honeypotResponse.json?.success === false && honeypotResponse.json?.data?.state === 'validation_failure',
    `status=${honeypotResponse.status} body=${honeypotResponse.text.slice(0, 300)}`
  );
  check('honeypot rejection sends no mail', mailEntries().length === 0);

  const overrideResponse = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce, cpms_recipient: 'attacker@evil.example', cpms_to: 'other@evil.example' }));
  check(
    'unexpected request fields (recipient override attempt) rejected with HTTP 400 even in disabled mode',
    overrideResponse.status === 400 && overrideResponse.json?.success === false && overrideResponse.json?.data?.code === 'unexpected_fields',
    `status=${overrideResponse.status} body=${overrideResponse.text.slice(0, 300)}`
  );
  check('unexpected-fields rejection sends no mail', mailEntries().length === 0);

  // ---- Phase 2: simulated environment activation + interception --------------
  copyFileSync(resolve(fixtureDir, enableFixture), resolve(muDir, enableFixture));
  const lintEnable = phpLint(`/var/www/html/wp-content/mu-plugins/${enableFixture}`);
  check('activation fixture passes php -l inside the container', lintEnable.includes('No syntax errors detected'), lintEnable);

  const live = await getDemoHtml();
  check('activated mode: technical non-live banner does NOT render', !live.html.includes('cpms-non-live-banner'));
  check('activated mode: privacy banner still renders', live.html.includes('id="cpms-privacy-banner"'));
  check('activated mode: minimal data-use disclosure still renders beside the form', live.html.includes('id="cpms-data-use-note"'));
  check('activated mode: honeypot field present and hidden from users', /name="cpms_website_url"/.test(live.html) && /<div class="cpms-form-honeypot" hidden/.test(live.html));
  nonce = extractNonce(live.html) || nonce;
  if (!nonce) throw new Error('Could not extract form nonce from activated /demo/ HTML.');

  const acceptedResponse = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce, cpms_discussion_topic: `${synthetic.topic} <script>alert(1)</script>` }));
  check(
    'activated mode: valid submission returns success with state handoff_accepted',
    acceptedResponse.status === 200 && acceptedResponse.json?.success === true && acceptedResponse.json?.data?.state === 'handoff_accepted',
    `status=${acceptedResponse.status} body=${acceptedResponse.text.slice(0, 300)}`
  );
  const acceptedMessage = acceptedResponse.json?.data?.message || '';
  check(
    'handoff_accepted wording is truthful: states mail-layer handoff and explicitly avoids a receipt/read/response-time promise',
    acceptedMessage.includes('تحویل داده شد') && acceptedMessage.includes('تضمین نمی‌شود') && !/تیم فروش|دریافت شد|مطالعه شد|در کمتر از|پاسخ در/.test(acceptedMessage),
    acceptedMessage
  );

  let entries = mailEntries();
  check('accepted submission reaches the intercepted mail layer exactly once', entries.length === 1, JSON.stringify(entries.length));
  const entry = entries[0] || {};
  check('mail targets EXACTLY the authorized recipient', entry.to === authorizedRecipient, JSON.stringify(entry.to));
  check('mail recipient cannot be overridden by request parameters (fixed code-bounded value)', entry.to === authorizedRecipient);
  check('mail subject identifies the CPMS website demo/consultation lead', entry.subject === expectedSubject, JSON.stringify(entry.subject));
  const message = typeof entry.message === 'string' ? entry.message : '';
  check(
    'validated payload maps correctly into the plain-text message',
    message.includes(synthetic.name) && message.includes(synthetic.org) && message.includes(synthetic.contact) &&
    message.includes(expectedOrgTypeLabel) && message.includes(expectedDoctorCountLabel) && message.includes(synthetic.topic),
    message
  );
  check('message carries the CPMS lead identification line', message.includes('CPMS website — demo/consultation lead'));
  check('no executable HTML from user input reaches the message (markup sanitized)', !message.includes('<script') && !message.includes('<img'), message.slice(0, 200));
  check(
    'Reply-To is set only from the validated email contact value (single safe header, nothing user-named)',
    Array.isArray(entry.headers) && entry.headers.length === 1 && entry.headers[0] === `Reply-To: ${synthetic.contact}`,
    JSON.stringify(entry.headers)
  );

  const phoneResponse = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce, cpms_contact_value: '09121234567' }));
  entries = mailEntries();
  check(
    'phone contact: submission still accepted (mail handoff), and no Reply-To header is set',
    phoneResponse.json?.data?.state === 'handoff_accepted' && entries.length === 2 && Array.isArray(entries[1].headers) && entries[1].headers.length === 0,
    `state=${phoneResponse.json?.data?.state} entries=${entries.length} headers=${JSON.stringify(entries[1]?.headers)}`
  );

  const noJsAccepted = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce }), { ajax: false });
  check(
    'no-JS accepted flow: server renders a role=status notice with the truthful handoff wording',
    noJsAccepted.status === 200 && noJsAccepted.text.includes('id="cpms-form-success-notice"') && noJsAccepted.text.includes('role="status"') && noJsAccepted.text.includes('درخواست شما ثبت شد'),
    `status=${noJsAccepted.status}`
  );
  check('no-JS accepted flow does not render the non-live banner', !noJsAccepted.text.includes('cpms-non-live-banner'));
  entries = mailEntries();
  check('no-JS accepted flow produced exactly one further mail handoff', entries.length === 3, JSON.stringify(entries.length));

  const liveOverride = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce, cpms_recipient: 'attacker@evil.example', to: 'other@evil.example' }));
  check(
    'activated mode: recipient override attempt via request fields rejected (HTTP 400, unexpected_fields)',
    liveOverride.status === 400 && liveOverride.json?.data?.code === 'unexpected_fields',
    `status=${liveOverride.status}`
  );
  check('recipient override attempt produced no additional mail', mailEntries().length === 3);

  const injection = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce, cpms_contact_value: 'attacker@example.test\r\nBcc: victim@evil.example' }));
  check(
    'header-injection contact (embedded CRLF) rejected as invalid input',
    injection.status === 200 && injection.json?.success === false && injection.json?.data?.state === 'validation_failure',
    `status=${injection.status} body=${injection.text.slice(0, 300)}`
  );
  check('header-injection attempt produced no mail', mailEntries().length === 3);

  const badNonce = await postDemoForm(validSubmission({ cpms_demo_nonce: 'tampered_nonce_value' }));
  check('activated mode: invalid nonce rejected with HTTP 403', badNonce.status === 403 && badNonce.json?.success === false, `status=${badNonce.status}`);

  const invalidFields = await postDemoForm({ cpms_demo_submit: '1', cpms_demo_nonce: nonce, cpms_contact_name: '', cpms_org_name: '', cpms_contact_value: 'not-a-contact', cpms_org_type: 'not_a_type', cpms_doctor_count: '' });
  check(
    'activated mode: validation failure returns field errors and success=false',
    invalidFields.status === 200 && invalidFields.json?.success === false && Object.keys(invalidFields.json?.data?.errors || {}).length >= 4,
    `status=${invalidFields.status}`
  );
  check('validation failure produces NO mail', mailEntries().length === 3);

  const postHits = wp('db', 'query', `SELECT COUNT(*) FROM wp_posts WHERE post_content LIKE '%${synthetic.contact}%';`);
  check('no lead payload persisted in wp_posts', postHits.split('\n')[1] === '0', postHits);
  const metaHits = wp('db', 'query', `SELECT COUNT(*) FROM wp_postmeta WHERE meta_value LIKE '%${synthetic.contact}%';`);
  check('no lead payload persisted in wp_postmeta', metaHits.split('\n')[1] === '0', metaHits);
  const optionHits = wp('db', 'query', `SELECT COUNT(*) FROM wp_options WHERE option_value LIKE '%${synthetic.contact}%';`);
  check('no lead payload persisted in wp_options', optionHits.split('\n')[1] === '0', optionHits);

  // ---- Phase 3: transport failure (handoff must not masquerade as success) ---
  writeFileSync(resolve(muDir, forceFailMarker), 'force wp_mail failure for this phase\n');
  const failedResponse = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce }));
  check(
    'wp_mail failure surfaced as HANDOFF_FAILED (HTTP 500, success=false, honest title+message)',
    failedResponse.status === 500 && failedResponse.json?.success === false && failedResponse.json?.data?.state === 'handoff_failed' &&
    (failedResponse.json?.data?.title || '').includes('انجام نشد') && (failedResponse.json?.data?.message || '').includes('اطلاعات شما ارسال نگردید'),
    `status=${failedResponse.status} body=${failedResponse.text.slice(0, 300)}`
  );
  entries = mailEntries();
  check('failed handoff attempted exactly one further mail call (logged by interception)', entries.length === 4, JSON.stringify(entries.length));
  check('failed handoff response contains no success wording', !(failedResponse.json?.data?.message || '').includes('ثبت شد'));

  const noJsFailed = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce }), { ajax: false });
  check(
    'no-JS failure flow: server renders a role=alert error notice (not a success notice)',
    noJsFailed.status === 200 && noJsFailed.text.includes('id="cpms-form-error-summary"') && noJsFailed.text.includes('role="alert"') && noJsFailed.text.includes('ارسال درخواست در حال حاضر انجام نشد') && !noJsFailed.text.includes('id="cpms-form-success-notice"'),
    `status=${noJsFailed.status}`
  );
  check(
    'no-JS failure flow preserves the entered values for retry',
    noJsFailed.text.includes(`value="${synthetic.org}"`),
    'organization value not re-filled'
  );

  // ---- Phase 4: restore the safe default --------------------------------------
  // Safety ordering: remove ONLY the activation fixture first. The interception
  // fixture stays installed until the final disabled-mode assertions are done,
  // so the last submission can still never reach a real mail transport.
  rmSync(resolve(muDir, enableFixture), { force: true });
  rmSync(resolve(muDir, forceFailMarker), { force: true });
  clearMailLog(); // drop the activated-phase entries; assert zero NEW mail below
  const restored = await getDemoHtml();
  check('deactivation: technical non-live banner renders again', restored.html.includes('id="cpms-non-live-banner"'));
  nonce = extractNonce(restored.html) || nonce;
  const restoredResponse = await postDemoForm(validSubmission({ cpms_demo_nonce: nonce }));
  check(
    'deactivated environment returns to delivery_disabled for valid submissions',
    restoredResponse.json?.data?.state === 'delivery_disabled',
    `body=${restoredResponse.text.slice(0, 300)}`
  );
  results.mailLogFinalEntries = mailEntries().length;
  check('deactivated environment sends zero further mail', results.mailLogFinalEntries === 0, JSON.stringify(results.mailLogFinalEntries));

  cleanupFixtures();
  check('cleanup: no PHP fixtures remain in the mapped mu-plugins directory', phpFilesInMuDir().length === 0, phpFilesInMuDir().join(', '));
} catch (error) {
  failures += 1;
  results.error = String(error.stack || error);
  console.error(`::error title=Delivery proof error::${results.error.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
} finally {
  cleanupFixtures();
  results.passed = results.checks.filter(c => c.pass).length;
  results.failed = failures;
  results.result = failures === 0 ? 'PASS' : 'FAIL';
  writeFileSync(resolve(outDir, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`== Demo lead-delivery proof: ${results.passed} passed, ${failures} failed ==`);
  if (failures > 0) process.exitCode = 1;
}
