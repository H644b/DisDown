# DisDown product website

## Platform and purpose
Web. A public-facing product website that helps Discord account holders understand DisDown and choose a desktop download. The primary action is a verified v0.2.0 release download; the source repository is secondary.

## Product truth
The root README.md, SECURITY.md, app source, and release assets are authoritative. DisDown is an independent, local, read-only Discord archive client for macOS, Windows, and Linux. It saves selected accessible content in HTML, JSON, CSV, Markdown, or plain text, optionally bundled in ZIP with media. User credentials stay in memory in the app. No DisDown backend or telemetry. The website never asks for a Discord credential or connects an account.

User-token automation is unsupported by Discord and can risk account termination. Bot-token scope is limited to accessible bot servers. DisDown cannot retrieve deleted or inaccessible content or record voice/video calls. Pseudonymization is not full anonymization. Surface these constraints in a focused decision section and FAQ.

## Brand and task commitments
Use the original public/logo.svg, self-hosted Noto Sans, blurple #5865f2, and the root app's neutral light/dark and Blurple Twilight family. This website extends that established world in a Persuade register: a distinctive, fluid product story rather than dashboard chrome. Real docs/screenshots imagery uses clearly labeled sample data. Support light, dark, and twilight themes consistently. Code-first is confirmed. Preserve all application source and existing processes.

## Delivery boundary
All website implementation and documentation stay in site/. No public site publication, Git commit, or root repository push before parent review. No credentials, local keys, private artifacts, user Discord data, or internal release workflows belong in the website.
