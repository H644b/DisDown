---
version: 1
slug: "src-renderer-app-tsx"
primary_target: "src/renderer/App.tsx"
related_targets: ["src/renderer/styles.css"]
---

# DisDown desktop redesign

Mode: Operate. Scope: all renderer screens, native package branding, and the current connected app. Product capabilities and consent remain intact. User explicitly rejected v0.1.0's visual treatment as AI-looking and chose: "Near-Discord match: follow Discord's current visual language closely." Code-first preference remains confirmed.

## Direction contract
THESIS: Discord's familiar desktop grammar carries an archive tool: conversations lead, selection is an ordinary control, and export options read like settings rather than a landing page.
OWN-WORLD: Account-synced Discord base themes, Nitro presets and custom gradients; Discord blurple actions, soft white text, clear 14–16px content typography, compact rectangular controls, circular avatars, and thin separators. No lavender brand wash, floating illustration, ornamental orbit, or inspirational headings.
STORY: Connect with explicit consent, browse familiar servers and conversations, check the items to export, configure the archive, and save to a local folder with actual progress.
FIRST VIEWPORT: A 36px title bar; 72px server rail, 248px channel tree, flexible transcript at 15px/23px, and a 264px export selection pane. Standard 48px channel headers, direct message hierarchy, compact checkboxes, and a persistent Continue action in the export pane. Connection is a focused credential form; configuration is a settings surface; Save is a filename/destination form.
FORM: User-pinned current Discord desktop canon, witnessed in the running Discord app. Seed 7fdc0e1f assigned index 5 is acknowledged; the user's explicit reference governs rather than an unrelated catalog world. No comps; build directly in code. The original custom monogram remains recognizable, recolored to the current action palette.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: checked items stay in context while the export pane updates immediately. Save has one purposeful file-transfer animation driven by real export phases and a subtle lit action button, honoring the original request. Reduced motion preserves static phase and progress information.

Account theme: read appearance only from the user settings protobuf after connection; synchronize on window focus after a 60-second cooldown and on explicit Sync Discord theme action. Bot/demo/unavailable settings use the standard dark base. Light mode and the themed picker must remain legible. The live account returned Blurple Twilight (preset22) with the Darker base.

Server artwork: the user's final instruction keeps the rounded shape and requires the image to fill the entire icon. Preserve the 13px radius with complete 44×44 coverage and zero button padding. Use initials for missing/failed artwork; animated icons respond to hover and respect reduced motion.

Finish review: the independent full review required stronger unchecked selection borders and opaque sticky-footer compositing. Both fixes were scored resolved in a subsequent verdict pass (disposition: ship at that fix-list scope). Dedicated control-border colors and full-opacity selection affordances preserve discoverability; the footer paints the account gradient below its overlay to occlude scrolling content.
