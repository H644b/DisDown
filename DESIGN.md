---
name: "DisDown"
description: "A familiar charcoal desktop client for collecting and saving Discord content."
colors:
  accent: "#bba5f5"
  accent-dark: "#282132"
  primary-hover: "#ccbafa"
  rail: "#1c1d23"
  sidebar: "#24252d"
  main: "#2b2c35"
  panel: "#25262e"
  input: "#1f2027"
  border: "#3c3d48"
  muted: "#b0b1c2"
  text: "#f0f0f6"
  secondary: "#3b3c48"
  secondary-hover: "#474856"
  success: "#9ed7b4"
  warning: "#f1cb8b"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "46px"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-1.8px"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "32px"
    fontWeight: 700
    letterSpacing: "-1px"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "26px"
    fontWeight: 720
    lineHeight: 1.3
    letterSpacing: "-0.65px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "13px"
    fontWeight: 650
  metadata:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  compact: "6px"
  field: "7px"
  control: "8px"
  destination: "10px"
  save: "11px"
  dialog: "14px"
  server: "15px"
  panel: "16px"
  circle: "50%"
spacing:
  compact: "4px"
  tight: "8px"
  small: "12px"
  medium: "16px"
  large: "20px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  input-default:
    backgroundColor: "{colors.input}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
  server-navigation:
    backgroundColor: "{colors.rail}"
    width: "72px"
    padding: "19px 0 16px"
  channel-navigation-active:
    backgroundColor: "#3d374f"
    textColor: "#e5d9fd"
    rounded: "{rounded.compact}"
    padding: "0 7px"
    height: "34px"
  selection-toggle:
    backgroundColor: "#ffffff05"
    textColor: "#aaa6bb"
    rounded: "{rounded.compact}"
    padding: "0"
    size: "23px"
  selection-toggle-checked:
    backgroundColor: "#bba5f52b"
    textColor: "#dfd1ff"
  reaction-chip:
    backgroundColor: "#34313f"
    rounded: "{rounded.compact}"
    padding: "0 5px"
    height: "28px"
  attachment-card:
    backgroundColor: "#24252e"
    rounded: "{rounded.control}"
    padding: "13px"
  save-action:
    backgroundColor: "{colors.accent}"
    textColor: "#2a2136"
    rounded: "{rounded.save}"
    padding: "18px 24px"
  folder-dialog:
    backgroundColor: "#29262f"
    rounded: "{rounded.dialog}"
    width: "850px"
    height: "560px"
---

# Design System: DisDown

## Overview

**Creative North Star: "The Discord-style archive client"**

DisDown uses familiar desktop client density: charcoal navigation, a slate conversation plane, quiet separators, and muted lavender selection ink. System UI typography keeps conversation content and controls easy to scan. This record covers the Electron-hosted renderer for macOS, Windows, and Linux, as implemented in `src/renderer/App.tsx` and `src/renderer/styles.css`.

Brand appears in the original D-and-download monogram, rounded square server marks, and the deliberate save moment. Most surfaces stay flat and tonal; the large Save collection control receives the lavender glow. Selection remains visible beside its source content, while the collection and export stages provide a steady path to a local archive.

**Key Characteristics:**
- Tonal charcoal surfaces with one lavender interaction accent.
- Compact desktop controls, readable transcripts, and independent scrolling regions.
- Explicit plus/check selection controls and persistent collection feedback.
- A restrained save animation, with stable reduced-motion states.
- Original geometric branding and consistent Lucide outline icons.

## Colors

The palette is cool charcoal with a muted lavender accent. The frontmatter preserves the source values; the names below explain their roles.

### Primary

- **Lavender ink** (`accent`): primary actions, active stages and server marks, links, selection outlines, carets, and keyboard focus.
- **Plum ink** (`accent-dark`): dark text and icons on the lavender primary controls.
- **Lifted lavender** (`primary-hover`): the standard primary button hover state. The larger Save collection button has its own brighter hover treatment in the component snippet.

### Secondary

- **Quiet green** (`success`): connected-session status. The completed save uses related green surfaces and icon colors, recorded in the save-state source rather than promoted into a second brand accent.
- **Warm amber** (`warning`): forum access and loading notices, using the existing source warning color.

### Neutral

- **Deep rail** (`rail`): the outer server navigation and compact connection segmentation.
- **Charcoal sidebar** (`sidebar`): channel navigation and inset conversation embeds.
- **Slate conversation** (`main`): the main transcript and export flow canvas.
- **Charcoal tray** (`panel`): the persistent collection and inspector region.
- **Recessed field** (`input`): default text fields.
- **Fine divider** (`border`): repeated row, section, and control separators.
- **Soft white** (`text`) and **lavender gray** (`muted`): primary copy and secondary UI copy.
- **Raised neutral** (`secondary`) and its hover tone (`secondary-hover`): secondary action buttons.

**The Selection Ink Rule.** Use lavender for active navigation, selected objects, focus, links, and the next primary action. Keep connection and completed-save feedback in the established green family.

Amber forum and export notices and pale red inline errors remain semantic feedback. Server and author colors belong to the content; they do not replace the interface palette. Translucent lavender washes on selected messages and selection controls stay translucent so the underlying content plane remains visible.

## Typography

**Display and Body Font:** the platform UI stack defined in the frontmatter, with Segoe UI and sans-serif fallback. The system face is part of the familiar desktop client language. The renderer has a base size (14px), with a compact transcript and control hierarchy.

### Hierarchy

- **Display:** the welcome heading, with the second line highlighted in lavender. It reduces at the compact-width breakpoint (39px).
- **Headline:** the configuration heading. The save-stage heading is a neighboring size (31px), reducing in short windows (28px).
- **Title:** the channel introduction. It grows on wide desktop windows (28px).
- **Body:** transcript copy. Paragraphs use a slightly looser line height (1.7) and a bounded measure (72ch); wide windows increase text size (13px) and measure (75ch).
- **Label:** ordinary primary and secondary actions. Smaller channel and metadata labels retain the same family and clear weight differences.
- **Metadata:** small support text. Existing timestamps and secondary content labels vary by context; those one-off sizes are not a replacement body scale.

Headings use balanced wrapping. Dates, message counts, and numeric fields use tabular numerals where the source specifies them. Code and raw structured data retain their code presentation.

## Layout

The renderer fills the window (100dvh). The outer body does not scroll; each long content region owns its scroll. The title bar has a fixed height (56px), three aligned regions, and a macOS traffic-light inset (94px left padding).

The browsing surface has four zones: a server rail (72px), channel sidebar (232px), flexible conversation, and collection tray (286px). Conversation and sidebar headers align at the same height (62px). The tray footer stays at the bottom while its selected-item list scrolls. The configuration view uses a centered container (1140px maximum), two unequal columns (1.08fr / 1fr), and a gap (65px), with a sticky bottom action bar. The save view centers a narrower content column (520px maximum). These are the current surface compositions; the surface brief retains their task-specific strategy.

Spacing is compact and contextual. Reused gaps and insets are captured in the frontmatter, with smaller content-specific adjustments in the source. Preserve this density instead of imposing a new strict grid.

### Desktop adaptation

- **At and above the wide width (1550px):** the channel sidebar grows (252px), the collection tray grows (310px), transcript text and measure increase, and header/search spacing expands.
- **At and below the compact width (1200px):** the rail, sidebar, and collection become narrower (65px / 207px / 250px). The topic and its divider hide, search narrows, and content padding and column gaps reduce. The four browsing zones remain present.
- **At and below the compact height (800px):** welcome spacing and the connection panel tighten; the save illustration and save title reduce; the empty collection uses less vertical space.
- **Window bounds:** the Electron shell starts at 1480 × 960 and enforces a minimum of 1000 × 680, as recorded in `src/main/index.ts`. The reviewed minimum-window capture confirms the compact desktop composition.

The destination dialog is bounded to the window: a fixed preferred size (850 × 560), full available width at most, a viewport-height cap (90vh), and surrounding backdrop padding (30px). Its shortcut column and directory list scroll within the dialog.

## Elevation & Depth

Everyday navigation and conversation surfaces use tonal layering and fine separators. Shadows are soft and localized. The destination dialog combines a diffuse shadow with a dimmed, blurred backdrop; blur marks protected dialog focus. The save illustration and requested glowing Save collection button carry the strongest ambient depth.

### Shadow Vocabulary

- **Primary hover:** a small black lift on an enabled primary button.
- **Embed inset:** a near-invisible inner top highlight on conversation embeds.
- **Save illustration:** diffuse dark depth beneath the archive glyph.
- **Save action:** a lavender ambient glow and a soft lower shadow, strengthened on hover.
- **Folder dialog:** a large diffuse black shadow above the blurred backdrop.

Exact shadow values are stored in `.impeccable/design.json`, outside the frontmatter schema.

**The Tonal Surface Rule.** Separate the everyday client regions through their charcoal values and fine dividers. Reserve large soft shadows for the destination dialog and the save moment.

## Shapes

Rounded rectangles carry controls and surfaces. Compact navigation and selection controls use the smaller corner steps; fields and ordinary buttons are slightly softer. The welcome connection panel and destination dialog have more generous corners. Server marks are rounded squares; user avatars and stage dots are circular. Fine borders distinguish selected controls, attachments, and repeated rows.

The original monogram in `public/logo.svg` combines a lavender rounded square, a dark D, and a downward archive arrow. Use the vector as the source for packaged raster derivatives, following `docs/ASSETS.md`. Lucide outline icons use the renderer's consistent stroke weight (1.8). Emoji in reactions remain conversation content.

## Components

### Buttons

Ordinary actions are compact, solid, and clear. Primary and secondary actions share their padding and corner shape from the frontmatter, with a minimum height (42px) and an icon-label gap (10px). Primary actions use lavender and dark ink; secondary actions use the raised neutral. Hover changes the surface tone, with only a small lift on the primary action. Disabled controls reduce opacity (0.45) and stop advertising clickability.

Keyboard focus uses a lavender outline (2px) outside the control (3px offset). Small icon controls are square (28px), with gently rounded corners (6px), muted icons at rest, and a faint light surface on hover. Text links use lavender, a small underline offset (3px), and an underline on hover.

### Inputs / Fields

Fields are recessed and softly rounded, with transparent borders at rest, a lavender border on focus, and a lavender caret. Placeholders use a cooler muted tone. Native checkboxes use the lavender accent and a compact square size (17px). Search, path, and filename fields combine the input with a shared dark container; preserve the containing field's visual boundaries and its accessible label.

### Navigation

Server marks use a rounded square (45px) with a stronger lavender active state and a slim, light active indicator. Channel rows are compact (34px), with muted labels at rest, a faint hover wash, and a plum-lavender active surface. Nested threads indent and reduce their row height. The stage navigation uses numbered circles, then completion checks, so progress remains explicit.

### Selection controls and reaction chips

A plus becomes a check without moving the original object. The standard selection control is a compact outlined square (23px), with a smaller variant (19px). Selected controls keep their lavender tint and border. Message controls become fully visible on hover, keyboard focus, or selection. Selected messages receive a quiet row wash; the collection tray updates beside the transcript.

Reaction chips show the content emoji and count beside a separate selection control. They have a fine plum border, a dark plum surface, and a stronger selected state. This interaction selects material for export.

### Cards / Containers

Attachments are compact bordered horizontal containers with an outline file icon, a title and size, and a selection action. They use the ordinary control corner step and a bounded width (365px maximum). Conversation embeds are nearby tonal blocks with a subtle inset highlight and a bounded width (375px maximum). Lists, settings, and selected items primarily use separators and rows.

### Forum post rows

Forum channels open directly into paged post rows in the conversation region. The heading identifies the channel (“Posts in #…”), followed by the loaded-count and selection hint. This hint uses supporting text (11px), a relaxed line height (1.7), and modest vertical margins (12px above, 10px below).

Post rows reuse the existing thread-row presentation: vertical padding (18px), a fine bottom divider, and an icon/content gap (15px). A bold title (13px) sits above a muted status label (11px) with a small separation (6px). The main row action opens the post's messages; its adjacent plus/check control selects the whole thread. The header's Back to forum control returns to the parent post list.

Load more posts uses the existing secondary button, centered with vertical margins (22px). Forum access notices use warm amber and supporting text (11px), with vertical margins (16px); their meaning remains visible beside the loaded post list.

### Save collection

The requested save moment uses the widest lavender control, larger type (15px, weight 700), softer corners, a minimum height (58px), and the ambient glow recorded in the sidecar. The archive illustration is already visible at rest. During saving, small packets descend into it (1.9s cycles) while its surface pulses (2.5s cycles). A completed save changes the archive glyph to green and settles through a brief scale-and-blur transition (0.6s). Indeterminate progress has a moving wave (1.7s); determinate progress reports the real percentage.

**The Save Ritual Rule.** The large glowing control and receiving-packet animation belong to saving a collection. Keep ordinary navigation and selection transitions brief and quiet.

General button state transitions are short (0.16s); message hover is slightly shorter (0.15s). Loading spinners rotate linearly (1s). Reduced-motion preference disables animations, transitions, and smooth scrolling while keeping progress and state text visible.

### Folder picker

The themed destination dialog contains a shortcut rail, editable path, filter, directory rows, optional new-folder row, and a fixed action footer. It opens with focus on an enabled control, contains forward and reverse Tab navigation, closes with Escape, and restores focus to the opener. Disabled files remain visible as context. Inline errors stay within the dialog, and Use this folder remains an explicit confirmation action.

## Do's and Don'ts

### Do:

- **Do** use the existing charcoal layers and lavender interaction roles for new renderer controls.
- **Do** keep selection controls explicit and show the checked state beside the original object.
- **Do** preserve visible keyboard focus, the folder dialog focus boundary, and focus restoration on close.
- **Do** retain scrollable content regions and accessible bottom actions at the minimum desktop window size.
- **Do** honor reduced motion while preserving the real progress, completion, and error information.
- **Do** derive packaged logo rasters from the original repository vector and retain the asset provenance record.

### Don't:

- **Don't** use the full lavender save glow on ordinary navigation or selection controls.
- **Don't** rely on hover alone to reveal the focused or checked message controls.
- **Don't** replace the original DisDown monogram or the consistent outline icon family with unrelated marks.
- **Don't** use green completion styling for an incomplete save or hide export notices behind decorative success feedback.
