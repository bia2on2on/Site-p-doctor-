# PR #32 — reference-to-CPMS truth map

Reference: `https://01a0f849-cd20-76e1-a6de-cd79f231f369.arena.site/` (the owner-provided URL).

## Inspection boundary

GitHub Actions Chromium loaded the reference's `?embed=true` document in its actual content frame (the Arena shell was not used for layout measurements). The rendered document title was `CPMS | سیستم مدیریت مطب و کلینیک برای وردپرس`; the selected frame had one H1, one header, and ten semantic sections. Measurements below are rendered CSS-pixel geometry, not a source-CSS audit. The original CSS/source HTML has not been recovered.

The Pages workflow uploaded reference and preview screenshots in artifact `visual-review-e68c563c68d1709a92c9744c03d7659de90193a2` (run `36928718219`, 4,228,549 bytes). Download attempts through both `gh run download` and direct `curl` ended at GitHub's Azure artifact host with `EOF` / `SSL_ERROR_SYSCALL`; therefore, the pixels have not been inspected or compared side by side. Do not claim visual parity. `VISUAL ACCEPTANCE = NOT VERIFIED`; visual scores remain `N/A`.

The reference page labels its content user-generated and unverified. Its copy, numerical metrics, mocked interface, role access, capabilities, testimonials, promises, and lead form are not Product Truth and must not be copied or implied.

## Rendered reference measurements

The following measurements were read from the selected content frame at the stated viewport sizes. Rectangles are `x, y, width × height` in CSS pixels. The page background is `rgb(245, 247, 251)`; body typography is Vazirmatn / `ui-sans-serif`, 16px / 24px. The floating navigation uses a 16px radius and `blur(24px)` glass treatment.

| Viewport | Header / navigation | Hero and composition | H1 | Content-frame page height / scroll width |
| --- | --- | --- | --- | --- |
| 390×844 | header h=106.5; nav `(16,16) 358×81.5` | hero h=1639.5, padding `144px 16px 64px`; grid `(16,144) 358×1185.5`, gap 48; copy `(16,144) 358×568`; media `(16,790) 358×569.5` | 36px / 45px | 16,364 / 398 (8px horizontal overflow) |
| 430×932 | header h=106.5; nav `(16,16) 398×81.5` | hero h=1639.5, padding `144px 16px 64px`; grid `(16,144) 398×1185.5`, gap 48; copy `(16,144) 398×568`; media `(16,760) 398×569.5` | 36px / 45px | 16,187 / 438 (8px horizontal overflow) |
| 768×1024 | header h=92.8; nav `(32,16) 704×67.8` | hero h=1431.5, padding `176px 32px 64px`; stacked grid `(32,176) 704×1033.5`; copy h=408; media `(32,632) 704×577.5`; gap 48 | 48px / 60px | 11,761 / 768 |
| 1024×768 | header h=92.8; nav `(32,16) 960×67.8` | hero h=938.6; two-column grid `(32,176) 960×540.6`, gap 48; media `(32,233.3) 495.7×426`; copy `(575.7,176) 416.3×540.6` | 54.4px / 65.28px | 9,334 / 1,024 |
| 1366×768 | header h=92.8; nav `(43,16) 1280×67.8` | hero h=832.6; grid `(43,176) 1280×478.6`, gap 48; media `(43,215.8) 669.6×399`; copy `(760.6,176) 562.4×478.6` | 54.4px / 65.28px | 8,942 / 1,366 |
| 1440×900 | header h=92.8; nav `(80,16) 1280×67.8` | hero h=832.6; grid `(80,176) 1280×478.6`, gap 48; media `(80,215.8) 669.6×399`; copy `(797.6,176) 562.4×478.6` | 54.4px / 65.28px | 8,942 / 1,440 |
| 1920×1080 | header h=92.8; nav `(320,16) 1280×67.8` | hero h=832.6; grid `(320,176) 1280×478.6`, gap 48; media `(320,215.8) 669.6×399`; copy `(1037.6,176) 562.4×478.6` | 54.4px / 65.28px | 8,942 / 1,920 |

The reference is a right-to-left, two-column desktop hero (media left, copy right) that stacks copy before media at 768px and below. At 1024px it remains two-column. Preserve the composition, scale, and rhythm where Product Truth permits; do not reproduce the reference's 8px mobile overflow as a design requirement.

## Element → truthful preview equivalent

| Reference composition | CPMS preview equivalent | Truth and implementation boundary |
| --- | --- | --- |
| Header, navigation, primary CTA | Existing CPMS preview header and same-page destinations | Keep the existing preview notice; link only to sections that exist. No invented product destination. |
| Hero statement and CTA | Existing bounded CPMS copy and non-live demo CTA | Preserve current Product Truth. CTA only navigates within the preview and discloses that no request is sent. |
| Four numeric trust/stat tiles | Three nonnumeric evaluation topics in `.value-strip` | Do not reproduce reference metrics, outcomes, or quantified claims. |
| Dashboard, queue, appointment, and notification mockup | `.media-reservation--hero` | Abstract, nonfunctional geometry only. No patient data, dashboard controls, queue state, or reference/stock imagery. |
| Eight feature cards | A compact grid of six evaluation topics sourced from the current CPMS page: the five required journey stages plus the existing manual-payment/financial-summary boundary | Phrase as items to assess in the offered version, not as verified functionality. Do not add SMS, online booking, prescriptions, branches, security, integrations, or other reference-only claims. |
| Four role portals (doctor, receptionist, patient, finance) | Three existing roles: reception, doctor, clinic management | Do not imply a patient or finance portal, role permissions, or server-side access guarantees. The second media reservation remains abstract and nonfunctional. |
| Four-step workflow | The required five-step flow: `نوبت → پذیرش → صف → ویزیت → پرونده` | Keep these five steps and their existing evaluation wording; do not replace them with the reference's four-step process or settlement promise. |
| Clinic-fit claims | Existing bounded `.role-fit-note` | Keep the current qualification; do not add claims about specialty coverage, branches, scale, or universal suitability. |
| Backup, security, engineering, and comparison sections | No equivalent section | Omit until each claim is supported by current-repository Product Truth. No backup, encryption, uptime, compliance, testing, or competitor comparison claims. |
| FAQ | Existing bounded questions | Retain the current caveats; do not copy reference answers or promises. |
| Demo form and delivery promises | Existing non-live CTA plus disclosure | No fields, lead submission, free/30-minute claim, response-time promise, or customer-data collection. |
| Footer | Existing CPMS preview footer and authorized public contact fact | Keep preview disclosure and only verified destinations/contact facts. |
| Reference Settings page | No reference equivalent | Keep the existing six Settings sections and behavior unchanged; carry over only the preview's shared design language. |

## Current local geometry pass

A local headless Chromium 153 capture of the current working tree was measured at all seven required widths after the responsive changes. The preview notice is 34px tall; subtract 34px from captured y-coordinates to compare with the reference content frame. Header, navigation, hero grid/copy, H1, media, and CTA rectangles now align with the saved reference measurements to within roughly 0.5 CSS px. Selected normalized preview measurements:

| Viewport | Hero grid | Abstract hero media | Primary CTA | Horizontal overflow |
| --- | --- | --- | --- | --- |
| 390×844 | `(16,144) 358×1185.5` | `(16,790) 358×569.5` | `(200,438.8) 174×48` | 0px (reference had 8px; intentionally corrected) |
| 430×932 | `(16,144) 398×1185.5` | `(16,760) 398×569.5` | `(240,438.8) 174×48` | 0px (reference had 8px; intentionally corrected) |
| 768×1024 | `(32,176) 704×1033.5` | `(32,632.2) 704×577` | `(562,408.8) 174×48` | 0px |
| 1024×768 | `(32,176) 960×540.6` | `(32,233.4) 495.7×425.8` | `(818,511.4) 174×48` | 0px |
| 1366×768 | `(43,176) 1280×478.6` | `(43,216) 669.6×398.5` | `(1149,479.4) 174×48` | 0px |
| 1440×900 | `(80,176) 1280×478.6` | `(80,216) 669.6×398.5` | `(1186,479.4) 174×48` | 0px |
| 1920×1080 | `(320,176) 1280×478.6` | `(320,216) 669.6×398.5` | `(1426,479.4) 174×48` | 0px |

These are DOM bounding-box measurements—not screenshot-difference results. The preview has seven top-level sections and is shorter than the reference at every width because unsupported reference-only material was deliberately omitted. Do not infer pixel, color, font-rendering, or whole-page visual parity from this geometry pass.

## Review gate

Required widths remain 390×844, 430×932, 768×1024, 1024-class, 1366×768, 1440×900, and 1920 sanity. Local CPMS screenshots and the six-section Settings page were recaptured and visually inspected. A matching reference screenshot is still unavailable, so side-by-side review at 390, 768, 1366, and 1440 could not be completed. `VISUAL ACCEPTANCE = NOT VERIFIED`; Hero, Header, Palette, Typography, Spacing, Cards/glass, Responsive composition, and Overall scores remain `N/A`.
