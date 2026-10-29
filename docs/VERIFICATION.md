# Verification matrix

Updated October 28, 2026 (America/New_York).

| Capability | Evidence | Status |
| --- | --- | --- |
| Consent, user/bot token forms, no renderer Node access | Real Electron desktop tests | Passed locally on macOS arm64 |
| Discord requests, pagination, 429 handling, errors, cancellation | Mocked HTTPS transport tests | Passed; not a live-account claim |
| Guild/channel role visibility | Permission invariant tests | Passed with synthetic roles/overrides |
| Servers, channels, categories, DMs, groups, threads, messages, reactions, profiles, media objects, roles, emoji, events, fields | Selection/collector tests and Electron sample workspace | Passed with sample data |
| JSON, HTML, CSV, Markdown, TXT and ZIP | Real temporary-file writes and ZIP inspection | Passed locally |
| Themed folder picker, path navigation, new folder, filename, replacement refusal | Electron end-to-end tests | Passed locally |
| Save completion, download state, minimum 1000×680 window | Desktop UI captures and tests | Passed locally |
| Cancel cleanup, attachment host restrictions, escaped HTML, CSV formula protection | Export invariant tests | Passed locally |
| Production dependency audit | npm audit --omit=dev | 0 reported vulnerabilities at check time |
| Live Discord account access | Local user-token session: 116 servers, 136 DMs/groups; history, profiles, reaction users, server metadata and thread-discovery requests | Passed for checked content; notices preserved for unavailable access. Live ZIP/media save and populated archived thread save also verified. |
| Live ZIP and attachment | Inspected HTML, JSON, manifest, 4 messages and a real downloaded attachment | Passed locally, 0 export warnings |
| Live forum browsing | Same connected user session: initial25 posts, Load more to50, open thread3 messages, return to forum | Passed; user-reported empty forum fixed |
| Live archived thread | Discovered populated archived threads, read history and saved a 2-message limited thread archive | Passed; limit and metadata verified |
| macOS arm64 distributable | Local and native GitHub Actions DMG/ZIP build + packaged app launch | Passed; final forum-fix rebuild pending |
| macOS Intel distributable | Native GitHub Actions DMG/ZIP build + packaged launch | Passed; final forum-fix rebuild pending |
| Windows x64 distributable | Native GitHub Actions Setup/portable EXE build + packaged launch | Passed; final forum-fix rebuild pending |
| Linux x64 distributable | Native GitHub Actions AppImage/DEB build + packaged launch under Xvfb | Passed; final forum-fix rebuild pending |
| Apple notarization / Windows publisher signing | Distribution certificates not configured | Not provided |

The initial suite contains 43 API/export/filesystem tests and 5 Electron interaction tests. Counts can change as regressions are added. CI stores per-platform screenshot evidence as artifacts. Fixture tests never establish access to all content of a real account.

A public release is gated on the recorded live verification and successful platform jobs. Source and package preparation may happen privately before that gate. A completed save can contain notices or a requested message limit; inspect the manifest before treating an archive as complete.
