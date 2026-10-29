---
version: 1
slug: "src-renderer-app-tsx"
primary_target: "src/renderer/App.tsx"
related_targets: ["src/renderer/styles.css"]
---

# DisDown desktop application

Mode: Operate. Desktop users browse familiar Discord conversations, select their own accessible content, then save an archive. The explicit Discord-style brief pins the client structure and dark surface. Code-first was explicitly chosen by the user.

## Direction contract
THESIS: A Discord-style archive client with a persistent collection tray; choosing individual objects never obscures the conversation.
OWN-WORLD: Charcoal rail and sidebar, slate conversation plane, muted lavender selection ink, system UI typography, rounded square server marks, fine separators, restrained density. The glowing Save control is reserved for the user-requested save ritual.
STORY: Connect only after consent, choose granular objects, configure a portable archive, choose a local destination, then see actual saved bytes and any access notices.
FIRST VIEWPORT: A 72px server rail, 232px channel tree, flexible chat transcript and 286px collection tray. A 56px top bar holds Choose / Configure / Save. The primary Next action stays at the bottom of the tray.
FORM: Brief-pinned Discord client and archive tray; seed 5445a533 assigned index 4 acknowledged, with the explicit Discord-style requirement taking precedence. Split-flap challenger declined for chronology-first navigation; adopt its stable row identity. Boarding-pass challenger declined for unrelated travel semantics; adopt explicit stage completion. Catalog challenger declined for losing conversation context; adopt dense selectable object coverage. Metro declined for breaking familiar client controls; adopt clear accent selection. Factory catalog declined for coded labels; adopt disciplined color usage. Reference-setting declined for inappropriate text topology; adopt consistent rule alignment.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: selecting a message quietly tints its row and adds it to the collection tray without moving the chat. Saving animates packets into an archive glyph while real phases, counts and bytes are reported; reduced-motion users receive stable progress states.
