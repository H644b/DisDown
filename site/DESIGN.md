---
name: "DisDown product website"
description: "The implemented editorial website extension of DisDown, with Light, Dark, and Blurple Twilight appearance."
colors:
  accent: "#5865f2"
  accent-hover: "#4752c4"
  ground: "#202024"
  surface: "#29292f"
  raised: "#323339"
  heading: "#fbfbfb"
  ink: "#efeff1"
  muted: "#b6b6bf"
  line: "#45454d"
  link: "#b0bbff"
  focus: "#b8c3ff"
  notice: "#f1ce8a"
  notice-ground: "#302c23"
  local-ground: "#17171b"
  header: "#202024"
  feature: "#5865f2"
  feature-ink: "#fff"
  feature-muted: "#fff"
  feature-line: "#a7afff"
  download-ground: "#2b2c33"
  feature-focus: "#fff"
  white: "#fff"
  light-ground: "#fbfbfb"
  light-surface: "#f0f0f3"
  light-raised: "#e8e8ed"
  light-heading: "#28282d"
  light-ink: "#2e2e34"
  light-muted: "#5d5e66"
  light-line: "#d7d7dc"
  light-link: "#3457c7"
  light-focus: "#4752c4"
  light-notice: "#705214"
  light-notice-ground: "#fff2d9"
  light-local-ground: "#eeeef3"
  light-header: "#fbfbfb"
  light-download-ground: "#eeeeF4"
  twilight-ground: "#10102e"
  twilight-surface: "#1a193b"
  twilight-raised: "#25244d"
  twilight-heading: "#f5f4ff"
  twilight-ink: "#e9e8ff"
  twilight-muted: "#bcb9dc"
  twilight-line: "#424269"
  twilight-link: "#bcc4ff"
  twilight-focus: "#c4ccff"
  twilight-notice: "#f1d39d"
  twilight-notice-ground: "#302a35"
  twilight-local-ground: "#101029"
  twilight-header: "#141333"
  twilight-download-ground: "#1c1a45"
  twilight-feature: "#333dc4"
  twilight-feature-line: "#9fa5ee"
  twilight-start: "#2c3fe7"
  twilight-end: "#261d83"
  twilight-wash-start: "#2c3fe718"
  twilight-wash-end: "#261d833d"
  archive-ground: "#202024"
  archive-ink: "#efeff1"
  archive-caption-ground: "#2b2c33"
  archive-caption-ink: "#f6f6ff"
  archive-caption-muted: "#c8c8d2"
  archive-preview-ground: "#24252a"
  archive-code-ink: "#e1e4ff"
  archive-divider: "#42434b"
  archive-description: "#c1c1ce"
  archive-link: "#c3cbff"
typography:
  display:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "clamp(55px,5.8vw,84px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-.04em"
  display-mobile:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "clamp(39px,10.3vw,65px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-.04em"
  headline:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "clamp(36px,4vw,57px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-.035em"
  title:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-.02em"
  body:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  lead:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
  body-small:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.65
  label-small:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.65
  navigation:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.65
  metadata:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  artifact-caption:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.65
  format-label:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-.025em"
  format-label-selected:
    fontFamily: "\"Noto Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-.025em"
  code:
    fontFamily: "monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  control: "4px"
  button: "5px"
  image-mobile: "6px"
  frame-mobile: "7px"
  panel: "8px"
  hero-frame: "12px"
  circle: "50%"
spacing:
  compact: "8px"
  tight: "12px"
  small: "16px"
  medium: "20px"
  content: "24px"
  roomy: "32px"
  section-gap: "60px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "15px 23px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-small:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.label-small}"
    rounded: "{rounded.button}"
    padding: "10px 16px"
  text-link:
    textColor: "{colors.link}"
    typography: "{typography.label-small}"
    height: "40px"
  header-navigation:
    backgroundColor: "{colors.header}"
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
    height: "88px"
  appearance-menu:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "8px"
    width: "210px"
  theme-choice:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  theme-choice-selected:
    backgroundColor: "{colors.surface}"
  format-tab:
    backgroundColor: "transparent"
    textColor: "{colors.feature-muted}"
    typography: "{typography.format-label}"
    padding: "14px 0"
  format-tab-selected:
    textColor: "{colors.feature-ink}"
    typography: "{typography.format-label-selected}"
  archive-preview:
    backgroundColor: "{colors.archive-ground}"
    textColor: "{colors.archive-ink}"
    rounded: "{rounded.panel}"
  policy-note:
    backgroundColor: "{colors.notice-ground}"
    textColor: "{colors.notice}"
    rounded: "{rounded.panel}"
    padding: "28px 30px"
  faq-disclosure:
    textColor: "{colors.heading}"
    typography: "{typography.label}"
    padding: "21px 0"
  platform-row:
    backgroundColor: "{colors.download-ground}"
    padding: "32px 0"
---

# Design System: DisDown product website

## Overview

**Creative North Star: "Conversation to keepsake"**

DisDown’s website gives the established desktop identity room to speak: the original D-and-download monogram, self-hosted Noto Sans, blurple actions, and familiar neutral grounds remain recognizable. Large left-aligned headings, open columns, and substantial real app imagery make the public surface feel like a product publication. The website does not inherit the app’s compact pane layout or its desktop-only density.

The visual authority remains the parent app’s DESIGN.md, .impeccable/design.json, and public/logo.svg. This file documents only the implemented website in site/dist, including its recovery page. Its three manually selectable website appearances extend the app world; they do not implement the app’s complete connected-account theme pipeline. The chosen editorial expression belongs to this website surface, while the shared identity stays intact.

**Key Characteristics:**

- Original logo, one Noto Sans family, and compact rectangular blurple actions.
- Large editorial type, open columns, and real sample-data app screenshots.
- A single semantic theme layer for Light, Dark, and Blurple Twilight website appearance.
- A fixed dark archive specimen inside the full-width blurple format passage.
- Visible content by default, brief state motion, and an immediate reduced-motion path.

This is a scan-mode record of the corrected `dist/index.html`, `dist/styles.css`, `dist/main.js`, and `dist/404.html`. The frontmatter is the normative primitive set; unprefixed color roles describe website Dark, while `light-*` and `twilight-*` record actual overrides. These are extracted documentation names, not newly added CSS variables. The surface contract remains in `.impeccable/surfaces/dist-index-html.md`. This record makes no publication claim.

## Colors

Neutral charcoal and clean light planes retain the app family, while Blurple Twilight introduces the same recognizable indigo direction at website contrast and density.

### Primary

- **Discord blurple** (`accent`) carries primary actions, selection ink, and the final headline punctuation. **Pressed blurple** (`accent-hover`) is the primary hover fill. **White action ink** (`white`) stays fixed on these controls.
- **Readable link and focus ink** (`link`, `focus`, with appearance-prefixed variants) belongs to the surrounding page theme. The common focus treatment is a solid outline (3px) with a clear offset (5px).
- **Format blurple** (`feature`) is the full-width format ground; Twilight uses its recorded `twilight-feature` override. `feature-ink`, effective `feature-muted`, and `feature-focus` are white. `feature-line` follows its own appearance override.
- **Twilight gradient stops** (`twilight-start`, `twilight-end`) are used by the small theme swatch. The separately recorded translucent wash stops belong to the page-background recipe in the sidecar, over the Twilight ground. Do not replace that wash with the opaque swatch gradient.

### Secondary

- **Notice amber** (`notice`, `notice-ground`, plus appearance overrides) supplies the focused account-risk note. It is semantic notice color, not a decorative accent. The specimen loading-error message retains its fixed amber presentation.

### Neutral

- **Page and sectional planes** (`ground`, `local-ground`, `download-ground`) establish the document rhythm. `header` is the opaque sticky navigation ground. Each of these has its implemented Light and Twilight override.
- **Inset planes** (`surface`, `raised`) support popovers, theme controls, and their hover or selected states.
- **Reading ink** (`heading`, `ink`, `muted`) separates headline, body, and supporting text. The page uses its own more readable website-muted roles rather than copying app metadata contrast.
- **Dividers** (`line`) separate open lists and sections. They are not a card outline around every piece of content.
- **Fixed archive planes and ink** (`archive-*`) preserve the dark exported-file presentation across all website themes. Caption, code, description, download ink, and divider roles are recorded separately because they do not consume the page’s theme variables.

**The Scoped Contrast Rule.** Use the active website semantic roles throughout the page. The format passage overrides supporting ink and focus to white; its archive specimen keeps its authored dark colors in every appearance.

### Appearance mapping and persistence

The CSS uses the same semantic variable names in all themes. Dark is the unprefixed root set; Light overrides the names listed by `light-*`; Twilight overrides the names listed by `twilight-*`. Roles without a variant keep their root assignment. The sidecar records variable-to-token mappings and the non-color background recipe. The late format-local assignments are authoritative over the earlier root supporting-ink fallback.

A valid stored `disdown-site-theme` choice wins at page load. With no valid stored choice, a Light system preference selects Light; otherwise it selects Dark. A bootstrap failure leaves the declared Dark fallback. The recovery page runs the same initializer before the shared CSS. There is no live system-preference listener or fourth “System” choice. Website theme state remains separate from desktop account appearance.

## Typography

**Display and Body Font:** self-hosted Noto Sans with the platform fallbacks in the frontmatter. The four shipped Latin weights are (400, 500, 600, 700), with `font-display: swap` and font synthesis disabled. No additional display font is introduced. Actual serialized data uses browser monospace rather than a custom code face.

### Hierarchy

- **Display:** the fluid hero headline uses the frontmatter’s desktop role, tight tracking, and balanced wrapping. Wide screens (at least 1600px) use a fixed larger size (91px). Intermediate widths use source-specific viewport sizes (6vw at 1150px and below; 6.3vw at 900px and below). Mobile uses the separate frontmatter role, keeping an intentional line break without requiring the seed’s proposed three-line composition.
- **Headline:** shared section headings use the recorded fluid role. The format, local-storage, and download headings have neighboring source clamps (38px / 4.2vw / 60px; 38px / 4.3vw / 62px; 40px / 4.4vw / 64px). Their mobile sizes are (37px, 40px, 42px); ordinary section headings become (36px). Keep these differences contextual rather than introducing another font family.
- **Title:** workflow titles establish the small-heading role. Editorial detail and appearance headings are larger (31px and 36px on desktop) where they lead a distinct passage; platform names use (24px). These use the same bold family and tight heading tracking.
- **Body and lead:** base reading text uses the frontmatter body role. Main introductory copy is slightly larger, with short measures (about 33–46ch in the observed layouts). Common detail text uses the smaller body role; FAQ answers use their own relaxed line-height (1.85, then 1.9 on mobile).
- **Label and navigation:** the primary action and compact header action have separate recorded label sizes. Desktop navigation is medium weight. Format labels become bold when selected, and on mobile use compact names (11px) across the five equal tabs.
- **Metadata and serialized data:** the final cascade makes platform hints, image captions, theme captions, and most supporting small print (12px). Archive captions and code remain (11px); mobile alternate-download and legal notes also use (11px). The final universal download-link size is (13px), overriding earlier responsive declarations. Do not copy superseded smaller values from earlier media blocks.

**The Identity Extension Rule.** Keep the original logo, Noto Sans, and blurple action roles. Let the website use editorial scale and open document flow without copying the app’s pane layout.

## Layout

The website is a normal scrolling document with a sticky header, not a collection of independent app scroll panes. The central section width is the smaller of the content cap (1264px) and the available width minus the desktop gutters (112px total). Header content uses a wider cap (1376px) and smaller total inset (64px). The header has a thin bottom divider and an opaque theme ground. Anchor scrolling reserves space above the target (110px, then 85px on mobile).

Desktop uses asymmetrical open columns: the hero has a dominant headline column beside the explanatory action column (1.9fr / 1fr); shared section introductions use (1.7fr / 1fr); the format selector sits beside the specimen (.7fr / 1.45fr). Three scope descriptions share a single ruled row, while the policy context, FAQ, local-storage passage, and download rows use their own related column proportions. Source-specific gaps are percentage based, generally (6–15%). Large vertical passages use roughly (100–145px) of padding; interior transitions commonly use (45–110px) of space. Colored sections fill the viewport width with their padding on the inner wrapper.

### Responsive behavior

| Boundary | Implemented adaptation |
| --- | --- |
| At least 1600px | Hero type grows to its wide value; the hero’s column gap tightens to (6%). |
| At most 1150px | Column gaps and header gaps narrow; the appearance text label hides while its accessible summary remains; hero proportions and type adapt. |
| At most 900px | Section gutters become (32px per side), the header becomes (76px), desktop navigation gives way to a disclosure menu, and several column ratios and spacing values tighten. Most story content remains in columns at this boundary. |
| At most 640px | Section gutters become (20px per side), the header becomes (68px) with its own (18px) inset, and the header download button hides. The hero and narrative columns stack in reading order; the hero’s action and platform hint share a small two-column row. Main story sections use (78px) vertical padding, with local and colored passages using their smaller authored padding. |
| At most 640px, formats | The vertical selector becomes five equal horizontal tabs. The preview remains a bounded scrolling specimen (280px high), preserving access to real content without widening the page. |
| At most 640px, downloads | Each platform is a two-column icon/name row, with package links beneath the name; auxiliary resource links stack. Footer navigation wraps. |

All images preserve their intrinsic aspect ratio. The hero’s frame is slightly wider than the mobile text measure through a small negative inline margin (5px); this is intentional product proof, not page overflow. Desktop preview height is (300px), tablet (270px), and mobile (280px). Long serialized text wraps and scrolls inside the specimen. The browser report covers widths (360px through 1600px); it is evidence for this local artifact, not a promise about every browser.

The recovery page uses the same section wrapper, font, ground, ink, brand, and primary action. It has a simple vertical content stack with outer block padding (120px), a fluid heading, and no website menus.

## Elevation & Depth

This is a hybrid of flat editorial sections and localized diffuse elevation. Theme grounds, open space, and thin dividers do most of the structural work. The large genuine app image and open navigation/appearance menus share the same theme-aware shadow. The fixed dark archive specimen is separated by tone and clipping rather than another shadow. Twilight’s subtle page wash comes from the retained brand family; it does not replace product imagery.

### Shadow Vocabulary

- **Product and popover shadow, Dark/Twilight:** `0 28px 70px -30px #0008`.
- **Product and popover shadow, Light:** `0 28px 70px -30px #25254d38`.

**The Proof Surface Rule.** Use tonal grounds and thin dividers for ordinary sections. Reserve the diffuse shadow for genuine product imagery and open navigation or appearance popovers.

Motion serves immediate state changes. Primary buttons change fill over (180ms) and lift by (2px) over (250ms); inline arrows and disclosure marks also use brief state transitions. A supported View Transition reveals a theme from the activation point with a circle expansion (460ms), using the source exponential ease-out. The named hero-image group uses (420ms). Format previews use a short opacity/position settling animation (240ms). Content has no entrance-animation dependency. When reduced motion is requested, the script skips theme and preview animation, scrolling becomes immediate, hover lift is removed, and the CSS reduces ordinary transition/animation durations to (0.01ms). Browsers without View Transition support apply theme changes directly.

## Shapes

Rectangular forms remain close to the desktop brand without importing its dense UI. Primary actions have restrained corners (`button`); theme choices and small menu items use the slightly tighter `control` corner. The hero frame is larger (`hero-frame`), while popovers, archive specimens, notices, and detail images generally share `panel`. On mobile, hero and notice corners use `frame-mobile`, and detail/settings images use `image-mobile`. Only the small appearance swatches are circular. The original logo’s silhouette is preserved as an asset.

Ordinary boundaries are thin single-pixel dividers. Active mobile format tabs receive a stronger underline (2px). The format specimen clips its caption/preview/footer inside one rounded outline; code and embedded content scroll internally. There are no pill-shaped primary actions or decorative borders around each editorial column.

## Components

### Buttons and text links

Primary actions are compact, confident blurple rectangles with white ink, a short label, and an inline download arrow. The main action uses the frontmatter padding and a minimum height (55px); the compact header variant uses (42px). Hover changes the fill and lifts the action; active returns it to rest. The hero’s mobile action uses its authored compact dimensions (49px minimum height). The shared focus outline remains outside the shape. Text links use the active link role and a directional icon; the icon translates briefly on hover. Keep the website’s source links and download links as anchors.

### Navigation and appearance menu

The sticky header holds the original brand, three section links, a native details-based appearance control, and the compact download action. The mobile disclosure menu replaces the section links at the recorded breakpoint and includes a download destination. Appearance and mobile menus close on outside click; Escape closes an open menu and returns focus to its summary. A menu-originating theme selection, including the already-active theme, closes the appearance menu and returns focus with no scroll jump. Inline theme buttons lower on the page keep their own focus.

The appearance popover is narrow, padded, and raised on the theme surface; its three buttons show a check only for the active choice. The header icon follows the selection. The same state is reflected by the inline theme-choice buttons and a polite live announcement. The swatch controls use a thin border at rest, then the link-colored border and inset surface when selected. They are choices, not inputs for a credential or an account connection.

### Genuine product image

The hero is an image of the real app with fabricated sample data, not a live web client. A theme choice swaps that hero between the three authored Light, Dark, and Blurple Twilight captures. The forum and export-settings detail images remain their authored captures; the website does not recolor every screenshot. Keep the visible sample caption and meaningful alternative text. The frame preserves intrinsic proportions and uses the localized image shadow.

### Format showcase and archive specimen

Five real format choices use tab semantics with one roving tab stop. Selection changes the filename, explanation, preview, and matching sample download. Arrow keys wrap in either direction; Home and End select the first and last format. The tablist’s announced orientation switches with the layout. Desktop labels emphasize selected weight and a directional arrow; mobile selection uses bold text and a white underline. All section controls and the focusable panel inherit the local white focus token.

HTML is a sandboxed embedded sample; the four text formats fetch their local generated files and insert them as text. The specimen keeps a dark caption/preview/footer in every appearance. Loading and fetch failure have visible states, and the sample download remains available when preview loading fails. Text responses are cached; stale requests do not replace a newer selection. The separate ZIP sample is an ordinary download link. These are sample artifacts rather than an account-connected export flow.

### Policy note and FAQ disclosures

A single notice-colored surface gives the account-risk context visual weight. It is the deliberate exception to the open-column pattern, with theme-aware amber ink and its own rounded inset ground. FAQ items are native details/summary disclosures separated by thin rules, with a compact plus that rotates when open. They preserve ordinary keyboard operation; the answers do not use a custom animated height container.

### Platform download rows

Three open, ruled rows align an inline platform SVG, platform name/hint, and package links. Package choices remain readable links with a download glyph; alternatives sit beneath them. Mobile keeps the icon aligned with the platform title while moving links below the name. The section and its rows use the download ground rather than a grid of raised cards. No download-progress or installer state is represented by this website component.

The sidecar contains ten self-contained, source-derived specimens, including both primary-action sizes, navigation/appearance, theme choice, format tabs, the archive specimen, notice, FAQ, package row, and text link. It introduces no input-field pattern because the implemented website has none.

## Do's and Don'ts

### Do:

- **Do** use the original monogram and self-hosted Noto Sans with the established blurple primary action.
- **Do** apply website semantic roles to new website content and preserve the format section’s local white focus override.
- **Do** keep genuine app imagery at its intrinsic aspect ratio and retain visible sample-data captions.
- **Do** preserve document reading order when columns stack, with the format tabs becoming a horizontal five-item row on mobile.
- **Do** preserve visible focus, keyboard tab behavior, disclosure semantics, and access to sample downloads when a preview fails.
- **Do** keep all content visible without entrance animation and retain the reduced-motion fallback.

### Don't:

- **Don’t** treat this website document as permission to change the parent application’s tokens, density, themes, or layout.
- **Don’t** replace product evidence with a simulated app shell, ornamental illustration, or generic feature-card grid on this surface.
- **Don’t** apply the website’s three-theme switch to every image or imply that it implements the app’s complete account appearance system.
- **Don’t** flatten the fixed dark archive specimen into the page theme or let the page’s ordinary focus color leak into the blurple format passage.
- **Don’t** add credential fields, account connection flows, invented adoption statistics, or unsupported product claims.
- **Don’t** hide core content behind motion or describe local browser evidence as public deployment or platform-release validation.
