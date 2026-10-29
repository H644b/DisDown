---
name: "DisDown"
description: "The implemented v0.2.0 Discord-near desktop archive interface, with connected-account appearance."
colors:
  accent: "#5865f2"
  accent-hover: "#4752c4"
  white: "#ffffff"
  main: "#36373e"
  sidebar: "#323339"
  rail: "#2c2d32"
  surface: "#393a41"
  raised: "#3c3d45"
  text: "#f3f3f4"
  heading: "#ffffff"
  muted: "#abacb2"
  control-border: "#9da0aa"
  border: "color-mix(in srgb, #f3f3f4 15%, #36373e)"
  hover: "color-mix(in srgb, #f3f3f4 7%, #36373e)"
  selected: "color-mix(in srgb, #f3f3f4 13%, #36373e)"
  selection-bg: "color-mix(in srgb, #5865f2 20%, #36373e)"
  link: "#a6b9ff"
  focus: "#9faeff"
  button-focus: "#92a7ff"
  input-focus: "#8c9cff"
  caret: "#aebaff"
  notice-bg: "#343025"
  notice-text: "#f1ce8a"
  error-bg: "#41292c"
  error-text: "#ffb9b6"
  success: "#7dd3a6"
  success-bg: "#17352a"
  light-main: "#fbfbfb"
  light-sidebar: "#fbfbfb"
  light-rail: "#f3f3f4"
  light-surface: "#ffffff"
  light-raised: "#ffffff"
  light-text: "#2e2e34"
  light-muted: "#5d5e66"
  light-heading: "#28282d"
  darker-main: "#202024"
  darker-sidebar: "#1a1a1e"
  darker-rail: "#121214"
  darker-surface: "#242429"
  darker-raised: "#28282d"
  darker-text: "#efeff1"
  darker-muted: "#96979e"
  darker-heading: "#fbfbfb"
  midnight-main: "#000000"
  midnight-sidebar: "#000000"
  midnight-rail: "#000000"
  midnight-surface: "#0a0a0c"
  midnight-raised: "#121214"
  midnight-text: "#d4d5d8"
  midnight-muted: "#81828a"
  midnight-heading: "#dcdcdf"
  light-input: "#eeeeef"
  light-control-border: "#767680"
  custom-dark-control-border: "#d0d1d8"
  custom-light-control-border: "#464651"
  light-border: "#d7d7dc"
  light-hover: "color-mix(in srgb, #2e2e34 6%, #fbfbfb)"
  light-selected: "color-mix(in srgb, #2e2e34 12%, #fbfbfb)"
  light-selection-bg: "#e5e9ff"
  light-link: "#3457c7"
  light-focus: "#5865f2"
  light-notice-bg: "#fff2d9"
  light-notice-text: "#705214"
  light-error-bg: "#fce5e5"
  light-error-text: "#9f292d"
  light-success: "#247644"
  light-success-bg: "#e4f1e8"
typography:
  base:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "14px"
    fontWeight: 400
  body:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  headline:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.4px"
  save-title:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.4px"
  connection-title:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.4px"
  section:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
  navigation:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "13px"
    fontWeight: 500
  metadata:
    fontFamily: "\"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "10px"
    fontWeight: 400
rounded:
  compact: "3px"
  control: "4px"
  reaction: "5px"
  dialog: "7px"
  panel: "8px"
  server: "13px"
  circle: "50%"
spacing:
  compact: "4px"
  tight: "8px"
  small: "12px"
  medium: "16px"
  large: "20px"
  content: "24px"
  section: "28px"
  roomy: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  input-default:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  server-navigation:
    backgroundColor: "{colors.rail}"
    width: "72px"
    padding: "12px 0"
  server-icon:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.server}"
    size: "44px"
    padding: "0"
  channel-navigation-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "35px"
  selection-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    size: "20px"
    padding: "0"
  selection-toggle-checked:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
  reaction-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.reaction}"
    padding: "0 6px"
    height: "30px"
  attachment-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "14px"
  format-row-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "15px 12px"
  save-action:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "15px 20px"
  folder-dialog:
    backgroundColor: "{colors.sidebar}"
    rounded: "{rounded.dialog}"
    width: "860px"
    height: "580px"
---

# Design System: DisDown

## Overview

**Creative North Star: "The familiar Discord archive"**

DisDown follows the current Discord desktop grammar selected by the user: compact navigation, readable conversations, ordinary selection controls, and settings-like export screens. The implemented v0.2.0 world replaces the rejected lavender and marketing treatment. The original D-and-download monogram remains recognizable in blurple and white.

Connected-account appearance supplies the surfaces, text, and interaction roles throughout browsing, export settings, saving, and the folder picker. Fixed blurple actions establish continuity across base modes, presets, and custom gradients. Density and familiar behavior carry the interface; brand expression stays in the monogram and the subtle glow on Save export.

**Key Characteristics:**

- Account-derived base palettes and gradients, with fixed blurple primary actions.
- Self-hosted Noto Sans, clear transcript hierarchy, and compact rectangular controls.
- Independent desktop scroll regions and a persistent selection summary with Continue.
- Explicit unchecked and checked selection states beside the source content.
- A purposeful transfer animation with static reduced-motion progress information.

This is a scan-mode record of the implemented renderer, not a seed. Its authority is `src/renderer/App.tsx`, `src/renderer/styles.css`, `src/renderer/theme.ts`, `src/shared/discord-theme-facts.json`, and `public/logo.svg`; the direction contract remains in `.impeccable/surfaces/src-renderer-app-tsx.md`. The frontmatter holds normative primitives for the standard Dark base and explicitly named variants. Runtime appearance overrides are authoritative; the pre-effect CSS fallback is not another visual identity.

Visual evidence is the fabricated-data capture set in `.impeccable/review/`: `browser.png`, `minimum-window.png`, `light-browser.png`, `blurple-browser.png`, `options.png`, `blurple-options.png`, `save.png`, and `picker.png`. The latest scoped verdict accepted the two finish fixes for unchecked controls and footer occlusion; it is not a new whole-app review.

## Colors

The neutral palette follows the account. Blurple remains the stable primary action and the original brand color; gradients provide account appearance rather than a second marketing palette.

### Primary

- **Discord blurple** (`accent`): primary actions, checked selection controls, active server fallback, native checkboxes, bot labels, and progress. **Pressed blurple** (`accent-hover`) supplies the primary hover state.
- **White action ink** (`white`): text and icons on blurple controls and the original monogram. It does not switch to the account's ordinary text role.
- **Readable links and focus** (`link`, `focus`): theme-aware link ink, compound-field focus borders, and radio outlines. Ordinary button focus, simple-input focus, and caret retain the fixed source roles `button-focus`, `input-focus`, and `caret`.

### Secondary

- **Success green** (`success`, `success-bg`): connected status and completed-export surfaces.
- **Notice amber** (`notice-text`, `notice-bg`): consent policy and access/export notices. Forum notices currently consume the same fixed dark amber through the source warning role.
- **Error red** (`error-text`, `error-bg`): error semantics. Inline errors and the top error notice use error text; do not infer that every error is rendered on the error background role.

### Neutral

- **Conversation plane** (`main`): transcript and full export-stage canvas.
- **Navigation plane** (`sidebar`): channel tree; also the base for the selection panel (`--panel`).
- **Outer frame** (`rail`): server rail; also the base title bar and Dark input role. Light inputs use `light-input`.
- **Inset and raised planes** (`surface`, `raised`): attachments, embeds, reactions, secondary controls, and local hover surfaces.
- **Content ink** (`text`, `heading`, `muted`): body content, primary headings, and secondary labels. The Light muted role is the value actually returned by the theme function, rather than the unused muted value in the raw Light facts.
- **Interaction boundaries** (`control-border`): visible unchecked boxes. **Dividers and states** (`border`, `hover`, `selected`, `selection-bg`) use the exact source color mixes; selected messages receive the dedicated selection surface.

**The Account Appearance Rule.** Use the consumed semantic CSS roles from theme.ts. Resolve the connected appearance once for the whole renderer, including export settings, Save, and the folder picker; do not substitute a fixed brand wash.

**The Control Border Rule.** Unchecked selection controls use --control-border at full opacity. Decorative dividers use --border; they must not stand in for an interactive boundary.

### Base variants

The prefixed `light-*`, `darker-*`, and `midnight-*` primitives are the implemented account variants, not optional redesign palettes. Dark is the default for demo/bot sessions and unavailable appearance. System resolves to Dark or Light from the OS color-scheme preference. Darker uses deeper charcoal; Midnight uses black main/sidebar/rail planes with slightly raised inset surfaces. The base `--panel` follows sidebar; `--titlebar` follows rail; dark input follows rail. Blurple, its hover state, and white action ink stay fixed. Link, focus, notice, error, and success roles switch to their Light variants for a Light base.

A Light account with the dark-sidebar option uses the Darker rail/sidebar surfaces and a local channel-sidebar text/input/divider override. Preserve that scoped override rather than darkening the transcript or picker. Custom themes use the separate `custom-dark-control-border` or `custom-light-control-border` before text tinting.

### Presets and custom gradients

The following catalog is the consumed 24-preset snapshot from `discord-theme-facts.json` (source checked 2026-10-28). A preset determines its base, color stops, and angle. The table records gradient recipes, not additional flat-color primitives.

| ID | Preset | Base | Angle | Color stops |
| --- | --- | --- | --- | --- |
| 0 | Mint Apple | light | 180° | #56b69f 6.15%, #63bc61 48.7%, #9eca67 93.07% |
| 1 | Citrus Sherbert | light | 180° | #f3b336 31.1%, #ee8558 67.09% |
| 2 | Retro Raincloud | light | 148.71° | #3a7ca1 5.64%, #7f7eb9 26.38%, #7f7eb9 49.92%, #3a7ca1 73.12% |
| 3 | Hanami | light | 38.08° | #efaab3 3.56%, #efd696 35.49%, #a6daa2 68.78% |
| 4 | Sunrise | light | 154.19° | #9f4175 8.62%, #c49064 48.07%, #a6953d 76.04% |
| 5 | Cotton Candy | light | 180.14° | #f4abb8 8.5%, #b1c2fc 94.28% |
| 6 | Lofi Vibes | light | 179.52° | #a4c0f7 7.08%, #a9e4e8 34.94%, #b0e2b8 65.12%, #cfdfa2 96.23% |
| 7 | Desert Khaki | light | 38.99° | #e7dbd0 12.92%, #dfd0b2 32.92%, #e0d6a3 52.11% |
| 8 | Sunset | darker | 141.68° | #48288c 27.57%, #db7f4b 71.25% |
| 9 | Chroma Glow | darker | 128.92° | #0eb5bf 3.94%, #4c0ce0 26.1%, #a308a7 39.82%, #9a53ff 56.89%, #218be0 76.45% |
| 10 | Forest | darker | 162.27° | #142215 11.2%, #2d4d39 29.93%, #454c32 48.64%, #5a7c58 67.85%, #a98e4b 83.54% |
| 11 | Crimson Moon | darker | 64.92° | #950909 16.17%, #000000 72% |
| 12 | Midnight Blurple | darker | 48.17° | #5348ca 11.21%, #140730 61.92% |
| 13 | Mars | darker | 170.82° | #895240 14.61%, #8f4343 74.62% |
| 14 | Dusk | darker | 180° | #665069 12.84%, #91a3d1 85.99% |
| 15 | Under The Sea | darker | 179.14° | #647962 1.91%, #588575 48.99%, #6a8482 96.35% |
| 16 | Easter Egg | light | 180° | #7289da 4%, #4e5d94 96% |
| 17 | Retro Storm | darker | 148.71° | #3a7ca1 5.64%, #58579a 26.38%, #58579a 49.92%, #3a7ca1 73.12% |
| 18 | Neon Nights | darker | 180° | #01a89e 0%, #7d60ba 50%, #b43898 100% |
| 19 | Sepia | darker | 69.98° | #857664 14.14%, #5b4421 60.35% |
| 20 | Strawberry Lemonade | darker | 161.03° | #af1a6c 18.79%, #c26b20 49.76%, #e7a525 80.72% |
| 21 | Aurora | darker | 239.16° | #062053 10.39%, #191fbb 26.87%, #13929a 48.31%, #218573 64.98%, #051a81 92.5% |
| 22 | Blurple Twilight | darker | 47.61° | #2c3fe7 11.18%, #261d83 64.54% |
| 23 | Hexagon | darker | 135° | #4645ff 0%, #af01f3 33.33%, #ff6698 66.67%, #f89a03 100% |

The shared `--app-background` carries the linear gradient. Transparent main/sidebar/rail/titlebar role overlays reveal it; preset Dark overlays use chat/sidebar/rail/frame opacities (0.8 / 0.85 / 0.9 / 0.7), and Light uses (0.85 / 0.8 / 0.85 / 0.65). The selection panel follows the sidebar overlay. Inputs, inset surfaces, and text are separately tinted by the theme function. Do not flatten these roles into a single screenshot color.

Returned custom colors, stops, angle, and intensity drive the same pipeline. Intensity changes both tint and overlay opacity; a single supplied color is repeated to form a valid gradient. Preserve the returned recipe and the source formulas instead of inventing preset matches. Blurple Twilight is preset 22 with the Darker base; it is an account variant, not DisDown's default palette.

## Typography

**Display and Body Font:** self-hosted Noto Sans, followed by the platform fallbacks in the frontmatter. The renderer imports Latin weights (400, 500, 600, 700) from `@fontsource/noto-sans` in `src/renderer/main.tsx`, with font synthesis disabled. No display face is introduced. Code retains its browser monospace presentation.

### Hierarchy

- **Base:** the desktop UI foundation. The body role is reserved for transcript content.
- **Body:** message copy at the frontmatter size and line height, with a bounded measure (75ch), preserved whitespace, and wrapping for long content. It becomes smaller at compact width (14px) and larger at wide width (16px).
- **Headline:** export-settings heading; the channel-introduction heading shares its size, weight, and tracking. Connection and Save have the separately recorded heading roles.
- **Section:** settings groups and compact section labels. The folder-dialog title is slightly larger (16px), while the conversation header uses (15px, 700).
- **Label and navigation:** compact actions and channel targets with distinct weight. Author names use (14px, 600); descriptions and many secondary labels use (12–13px).
- **Metadata:** timestamps, small type labels, and contextual information. Account/status hints may use the neighboring source size (11px). Category labels are uppercase content at (10px, 700) with modest tracking (0.3px).

Headings balance wrapping. Timestamps, dates, and numeric fields use tabular numerals where specified. Keep transcript reading size distinct from metadata; do not revive the former tiny message scale or promotional display headings.

## Layout

The Electron renderer fills the window (100dvh). The outer document does not scroll; the rail, channel list, transcript, selection/inspector, settings page, and picker directory list own their scroll regions. The usual window is (1480 × 960) and the minimum is (1000 × 680), as enforced in `src/main/index.ts`.

Browsing has a compact draggable title bar (36px), then four zones: server rail (72px), channel sidebar (248px), flexible conversation, and export selection (264px). The source headers are (49px), preserving the approximately 48px Discord header rhythm with their divider. macOS reserves left title-bar space (88px). The selection footer remains available while the list scrolls; Continue is disabled until a selection exists.

Settings use a centered content region (1100px maximum), outer padding (28px 48px 0), two flexible columns (1.1fr / 1fr), and a gap (56px). Its action footer is sticky at the bottom and must occlude content beneath it. Save uses a quiet left-aligned form within a centered content column (560px maximum), with outer padding (30px 42px). Keep those settings and destination surfaces operational and compact.

### Desktop adaptation

- **Wide width, at least 1650px:** sidebar grows to (280px), selection pane to (288px), transcript to (16px), channel targets to (14px), and message search to (200px).
- **Compact width, at most 1200px:** rail/sidebar/selection widths become (64px / 214px / 238px). Topic and divider hide; search narrows to (150px); transcript becomes (14px); settings column gap reduces to (36px). All four browsing zones remain available.
- **Compact height, at most 780px:** connection spacing tightens, welcome aligns to the top, Save's top margin reduces, and flow-heading spacing contracts. Content continues scrolling inside its region.

The folder picker has a preferred size (860 × 580), maximum width of the available space, a height cap (90vh), and backdrop padding (28px). Its shortcut column (154px) and directory list scroll independently. These are desktop adaptations; no phone layout is implemented.

Spacing follows the compact values in the frontmatter with source-specific adjustments, rather than an invented global grid. Long names truncate in navigation and selection rows; body content and raw data wrap within their region.

## Elevation & Depth

Everyday client regions are flat, separated by account-derived tone and thin lines. Connection has a small localized shadow; the folder picker uses a large diffuse shadow over a dimmed backdrop. Save export alone receives the requested subtle blurple glow. No hover lift, orbit, or floating illustration remains in this implementation.

### Shadow Vocabulary

- **Connection:** a focused credential panel above the main plane.
- **Save action:** a restrained blurple glow, slightly strengthened on hover.
- **Folder dialog:** deep diffuse separation from the dimmed application.

The sidecar records the exact source shadow and motion values. Its synthesized eight-step color ramps are panel previews, not new runtime palette tokens.

**The Tonal Surface Rule.** Separate everyday regions with account-theme surface roles and thin dividers. Keep diffuse shadows localized to connection, the folder dialog, and the Save action.

The sticky settings footer layers the account gradient beneath its main-surface overlay using a fixed background attachment. This makes the footer visually continuous with the theme while completely covering scrolled controls and text; a lone translucent main overlay is insufficient.

## Shapes

Controls and content blocks use compact rounded rectangles. Most fields, buttons, channel rows, attachments, and embeds share the control radius. Small selection variants and picker rows use the compact radius; reactions are slightly softer. The connection panel and folder dialog use their own modest radii. User avatars and radio indicators stay circular.

Server artwork fills its complete box (44 × 44) with `object-fit: cover`, clipped by the server radius (13px). Do not add internal image padding. Missing or failed artwork uses up to two initials; animated server artwork switches to GIF on hover when reduced motion is not requested. An active server keeps a narrow left indicator (4px wide, 28px tall). Initials and account-provided avatar colors are content, not new brand tokens.

The original vector in `public/logo.svg` uses the blurple rounded square with a white D and downward arrow. Keep that source as the basis for package icons and preserve its geometry. Lucide icons use a consistent renderer stroke weight (1.9), with heavier selection checks (3).

## Components

### Buttons

Solid, compact actions. Standard primary and secondary buttons share their frontmatter padding and radius, a minimum height (38px), and icon-label gap (8px). Primary uses blurple and white; hover uses the darker blurple. Secondary uses the account raised surface and muted label. No translation or shadow lift is added. Disabled controls reduce opacity (0.45).

Ordinary button/summary/tabindex keyboard focus is an outline (2px) with an offset (2px), using `button-focus`. Small icon controls are (28 × 28) with the control radius and a quiet hover surface. Text links use the link role and underline on hover.

### Inputs / Fields

Fields use the account input plane, text, thin divider border, and control radius. Simple input focus uses `input-focus` (2px outline, -1px offset); compound token and filename fields use a `focus` border on focus-within. The fixed caret role remains in the source. Search/path fields are compact compositions rather than separate raised cards. Native checkboxes are (19px) and use blurple.

### Navigation

The rail preserves full-size server artwork and initials. Channel rows keep navigation and export selection as separate controls: open the channel through its label, select it through its checkbox. The active row uses `selected`; hover uses `hover`. Standard rows are (35px), direct-message avatar rows (42px), and nested thread rows (29px) with left indentation (20px). The title-bar stages are plain text tabs for Browse, Export settings, and Save; they do not use the former numbered-circle sequence.

### Selection controls and reaction chips

The selection toggle is an empty outlined square at rest, becoming blurple with a white check when selected. It is not a plus icon. Standard size is (20px), small is (17px), and reaction selection is (14px). Channel, category, message, and reaction boundaries remain visible at full opacity; the profile-selection control over an avatar appears on row hover, focus, or selection. `aria-pressed` and explicit select/deselect labels carry the state.

Reaction chips have the recorded height, surface, and radius, with content emoji and count beside a separate selection control. Selected chips use `selection-bg` and a fine border. Inspecting or selecting a reaction remains an archive action; it does not send a Discord reaction.

### Cards / Containers

Attachments use the inset surface, thin divider border, control radius, and recorded padding, bounded to (400px). Embeds use a nearby bounded width (430px) and compact padding (13px 14px). Polls, stickers, and message components use the same low-depth language. Keep in-context content and its selection control together; do not turn each message into a floating card.

The export selection pane mirrors checked items immediately and retains its count, removal controls, and persistent Continue. The same pane may display profile/raw-data details with a scrollable tree, while the footer remains visible.

### Export settings

Format rows are spacious enough to scan (73px minimum), with a format icon, label, explanation, and circular radio mark (19px). Active uses `selected`; the ring and inner dot use `focus`. Content toggles remain ordinary settings rows divided by fine lines. Validation stays adjacent to the affected fields, and invalid dates disable Continue to save.

### Save and progress

Save export is the full-width action (54px minimum) with white text and the subtle source glow. Filename and destination are ordinary fields above it. The in-progress transfer illustration appears only while saving, with archive/folder icons and three offset file marks. The detail text is driven by real export phases; a percentage appears only when the source can determine it. Preserve cancellation, overwrite confirmation, completion path, and warning disclosure.

Control transitions take (0.12s); the file marks run (1.5s) with staggered delays (0 / 0.5s / 1s). Reduced motion removes animations, transitions, and smooth scrolling globally while keeping phase text, progress, and all actions usable.

### Folder picker

The themed picker is a contained dialog with header, shortcut navigation, editable path, refresh/parent controls, filter, new-folder action, scrollable entries, and fixed bottom actions. It inherits the same appearance as Save. Files remain visibly unavailable as destinations. Opening moves focus into the dialog; Tab is trapped, Escape closes it, and closing restores the previous focus. Empty, loading, and local error states occupy the directory region rather than breaking the dialog frame.

## Do's and Don'ts

### Do:

- Do use the semantic theme roles for every renderer stage and keep primary action text white.
- Do keep unchecked selection boundaries visible at rest and checked items visibly tied to their source.
- Do fill the complete rounded server-icon box with available artwork and fall back to initials when it cannot load.
- Do keep sample-data labels, permission notices, consent, and export warnings visible within the established hierarchy.
- Do keep the sticky settings footer opaque over scrolled content in every account theme.
- Do retain phase text, counts, progress, cancellation, and keyboard focus when motion is reduced.

### Don't:

- Don't restore the rejected lavender wash, ornamental orbit, floating illustration, or inspirational headings.
- Don't turn export settings into promotional cards or add product copy about internal theme-reading mechanisms.
- Don't add a message composer or imply that export selection sends a reaction or changes Discord content.
- Don't force gradients onto base themes or replace an account gradient with a fabricated palette.
- Don't pad server artwork inside its icon or stretch circular avatars into rounded squares.
- Don't report sampled captures or a scoped finish verdict as full live-account, release, or whole-app certification.
